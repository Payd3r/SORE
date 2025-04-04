import { processImage } from './imageProcessor';
import pool from '../config/db';
import { ResultSetHeader, Image, ImageType } from '../types/db';
import fs from 'fs';
import path from 'path';
import imageQueue from '../config/bull';
import sharp from 'sharp';
import { classifyImage } from './imageClassifier';
import { updateMemoryDates } from './memoryDateUpdater';

interface ProcessedImage {
  id: string;
  original_format: string;
  original_path: string;
  webp_path: string;
  thumb_big_path: string;
  thumb_small_path: string;
  metadata: ImageMetadata;
  buffer: Buffer;
}

interface ImageMetadata {
  taken_at: Date;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  location_address?: string;
  country?: string;
  type: ImageType;
}

interface ImageJob {
  filePath: string;
  originalName: string;
  memoryId: number | null;
  coupleId: number;
  userId: number;
  type?: string;
  id: string;
}

export async function processImageJob(job: ImageJob) {
  try {
    console.log(`[Worker] Processing image: ${job.originalName} (Job ID: ${job.id})`);

    // Aggiorna lo stato iniziale
    await updateJobProgress(job.id, 0, 'Inizio processamento');

    // Leggi il file
    await updateJobProgress(job.id, 5, 'Lettura file');
    const processedImage = await processImage({
      path: job.filePath,
      originalname: job.originalName,
      mimetype: 'image/jpeg',
      size: 0,
      fieldname: 'images'
    } as any);

    // Aggiorna lo stato dopo il processamento base
    await updateJobProgress(job.id, 20, 'File letto');

    // Estrazione metadati
    await updateJobProgress(job.id, 30, 'Estrazione metadati');
    const metadata = processedImage.metadata;

    // Conversione formato (se necessario)
    if (job.originalName.toLowerCase().endsWith('.heic') || job.originalName.toLowerCase().endsWith('.heif')) {
      await updateJobProgress(job.id, 40, 'Conversione formato HEIC');
    }

    // Leggi il buffer dell'immagine
    const imageBuffer = await fs.promises.readFile(processedImage.original_path);

    // Creazione miniature
    await updateJobProgress(job.id, 50, 'Creazione thumbnail');
    const thumbBigBuffer = await sharp(imageBuffer)
      .withMetadata()
      .rotate()
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 80,
        effort: 6
      })
      .toBuffer();

    await updateJobProgress(job.id, 60, 'Creazione thumbnail piccole');
    const thumbSmallBuffer = await sharp(imageBuffer)
      .withMetadata()
      .rotate()
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 80,
        effort: 6
      })
      .toBuffer();

    // Classificazione immagine
    await updateJobProgress(job.id, 70, 'Classificazione immagine');
    const type = await classifyImage(imageBuffer);

    // Aggiorna il database con i percorsi delle immagini processate
    await updateJobProgress(job.id, 80, 'Salvataggio nel database');
    const [result] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO images (
        original_path,
        webp_path,
        thumb_big_path,
        thumb_small_path,
        latitude,
        longitude,
        memory_id,
        couple_id,
        created_by_user_id,
        created_at,
        type,
        country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?, ?)`,
      [
        processedImage.original_path,
        processedImage.webp_path,
        processedImage.thumb_big_path,
        processedImage.thumb_small_path,
        metadata.latitude || null,
        metadata.longitude || null,
        job.memoryId || null,
        job.coupleId,
        job.userId,
        metadata.taken_at,
        type,
        metadata.country
      ]
    );

    // Aggiorna lo stato dopo il salvataggio nel database
    await updateJobProgress(job.id, 90, 'Pulizia file temporanei');

    // Elimina il file temporaneo
    if (fs.existsSync(job.filePath)) {
      fs.unlinkSync(job.filePath);
    }

    // Se c'è un memory_id, aggiorna le date del memory
    if (job.memoryId) {
      try {
        await updateMemoryDates(job.memoryId);
      } catch (error) {
        console.error(`[Worker] Error updating memory dates for memory ${job.memoryId}:`, error);
      }
    }

    // Aggiorna lo stato finale
    await updateJobProgress(job.id, 100, 'Completato');

    console.log(`[Worker] Successfully processed image: ${job.originalName} (Job ID: ${job.id})`);
    return result.insertId;
  } catch (error) {
    console.error(`[Worker] Error processing image ${job.originalName} (Job ID: ${job.id}):`, error instanceof Error ? error.message : 'Unknown error');
    await updateJobProgress(job.id, 0, `Errore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

async function updateJobProgress(jobId: string, progress: number, status: string) {
  const job = await imageQueue.getJob(jobId);
  if (job) {
    job.progress = progress;
    job.status = status;
    await imageQueue.updateJob(job);
    console.log(`[Progress] Job ${jobId}: ${progress}% - ${status}`);
  }
} 