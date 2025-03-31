import { processImage } from './imageProcessor';
import pool from '../config/db';
import { ResultSetHeader, Image } from '../types/db';
import fs from 'fs';
import path from 'path';

interface ImageJob {
  filePath: string;
  originalName: string;
  memoryId: number | null;
  coupleId: number;
  userId: number;
  type?: string;
}

export async function processImageJob(job: ImageJob) {
  try {
    console.log(`[Worker] Processing image: ${job.originalName}`);

    const processedImage = await processImage({
      path: job.filePath,
      originalname: job.originalName,
      mimetype: 'image/jpeg',
      size: 0,
      fieldname: 'images'
    } as any);

    // Aggiorna il database con i percorsi delle immagini processate
    const [result] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO images (
        original_path,
        jpg_path,
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
        processedImage.jpg_path,
        processedImage.thumb_big_path,
        processedImage.thumb_small_path,
        processedImage.metadata.latitude || null,
        processedImage.metadata.longitude || null,
        job.memoryId || null,
        job.coupleId,
        job.userId,
        processedImage.metadata.taken_at,
        processedImage.metadata.type,
        processedImage.metadata.country
      ]
    );

    // Elimina il file temporaneo
    if (fs.existsSync(job.filePath)) {
      fs.unlinkSync(job.filePath);
    }

    console.log(`[Worker] Successfully processed image: ${job.originalName}`);
    return result.insertId;
  } catch (error) {
    console.error(`[Worker] Error processing image ${job.originalName}:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
} 