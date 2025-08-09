import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import exifr from 'exifr';
import { ImageType } from '../types/db';
import heicConvert from 'heic-convert';
import { classifyImage } from './imageClassifier';


// Definisci il percorso base per le immagini (relativo alla cartella backend)
const MEDIA_BASE_PATH = 'media';

interface ImageMetadata {
  taken_at: Date;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  location_address?: string;
  country?: string;
  type: ImageType;
}

interface ProcessedImage {
  id: string;
  original_format: string;
  original_path: string;
  webp_path: string;
  thumb_big_path: string;
  thumb_small_path: string;
  metadata: ImageMetadata;
}

interface ImageFilesToDelete {
  original_path: string;
  webp_path: string;
  thumb_big_path: string;
  thumb_small_path: string;
  original_format: string;
  metadata: ImageMetadata;
}

interface NominatimResponse {
  address: {
    country: string;
    [key: string]: string | undefined;
  };
}

export async function processImage(file: Express.Multer.File): Promise<ProcessedImage> {
  const imageId = uuidv4();
  const imageDir = path.join(MEDIA_BASE_PATH, imageId);
  let originalFormat = path.extname(file.originalname).toLowerCase().slice(1);

  try {
    // Leggi il file
    let buffer = await fs.promises.readFile(file.path);
    // Estrai i metadati
    const metadata = await extractMetadata(buffer, originalFormat);

    if (originalFormat === 'heic' || originalFormat === 'heif') {
      const outputBuffer = await heicConvert({ buffer, format: 'JPEG', quality: 0.92 }) as Buffer;
      buffer = outputBuffer;
      originalFormat = 'jpg';
    }

    // Converti in WebP
    const webpBuffer = await sharp(buffer)
      .withMetadata()
      .rotate()
      .webp({
        quality: 90,
        effort: 6
      })
      .toBuffer();

    if (!webpBuffer || webpBuffer.length === 0) {
      throw new Error('La conversione ha prodotto file vuoti o non validi');
    }

    // Classifichiamo l'immagine dopo la conversione con fallback sicuro
    try {
      metadata.type = await classifyImage(buffer);
    } catch {
      metadata.type = ImageType.LANDSCAPE;
    }

    // Crea la directory per l'immagine
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Salva l'immagine originale e WebP
    const originalPath = path.join(imageDir, `original.${originalFormat}`);
    const webpPath = path.join(imageDir, 'image.webp');
    await fs.promises.writeFile(originalPath, buffer);
    await fs.promises.writeFile(webpPath, webpBuffer);

    // Crea le thumbnail in WebP
    const thumbBigBuffer = await sharp(buffer)
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
    const thumbBigPath = path.join(imageDir, 'thumb_big.webp');
    await fs.promises.writeFile(thumbBigPath, thumbBigBuffer);

    const thumbSmallBuffer = await sharp(buffer)
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
    const thumbSmallPath = path.join(imageDir, 'thumb_small.webp');
    await fs.promises.writeFile(thumbSmallPath, thumbSmallBuffer);

    // Elimina il file temporaneo
    await fs.promises.unlink(file.path);

    return {
      id: imageId,
      original_format: originalFormat,
      original_path: originalPath,
      webp_path: webpPath,
      thumb_big_path: thumbBigPath,
      thumb_small_path: thumbSmallPath,
      metadata: {
        ...metadata,
      }
    };
  } catch (error) {
    // Pulisci i file temporanei in caso di errore
    try {
      if (fs.existsSync(imageDir)) {
        await fs.promises.rm(imageDir, { recursive: true, force: true });
      }
      if (fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path);
      }
    } catch (cleanupError) {
      console.error('Errore pulizia file:', cleanupError);
    }

    throw error;
  }
}

async function getCountryFromCoordinates(lat: number, lon: number): Promise<string | undefined> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MemoryGroveCherisher/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Errore nella richiesta di geocoding');
    }

    const data = await response.json() as NominatimResponse;
    return data.address?.country;
  } catch (error) {
    console.error('Errore nel geocoding inverso:', error);
    return undefined;
  }
}

async function extractMetadata(buffer: Buffer, format: string): Promise<ImageMetadata> {
  try {
    const exif = await exifr.parse(buffer);
    const taken_at = exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal) : new Date();

    let country: string | undefined;
    if (exif?.latitude && exif?.longitude) {
      country = await getCountryFromCoordinates(exif.latitude, exif.longitude);
    }

    // Classifichiamo l'immagine dopo la conversione in JPG
    const type = ImageType.LANDSCAPE; // Default value

    return {
      taken_at,
      latitude: exif?.latitude,
      longitude: exif?.longitude,
      type,
      country
    };
  } catch (error) {
    // In caso di errore, usiamo un tipo casuale
    const imageTypes = Object.values(ImageType);
    const randomType = imageTypes[Math.floor(Math.random() * imageTypes.length)];

    return {
      taken_at: new Date(),
      type: randomType
    };
  }
}

export async function deleteImageFiles(files: ImageFilesToDelete): Promise<void> {
  const filesToDelete = [
    files.original_path,
    files.webp_path,
    files.thumb_big_path,
    files.thumb_small_path,
  ];

  for (const file of filesToDelete) {
    try {
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
      }
    } catch (error) {
      console.error(`Errore eliminazione file ${file}:`, error);
    }
  }

  const dir = path.dirname(files.original_path);
  try {
    if (fs.existsSync(dir)) {
      await fs.promises.rmdir(dir);
    }
  } catch (error) {
    console.error(`Errore eliminazione directory ${dir}:`, error);
  }
}

export async function processProfilePicture(file: Express.Multer.File): Promise<string> {
  try {
    //console.log('=== PROCESSING PROFILE PICTURE ===');
    //console.log('Original file:', file);

    // Leggi il file
    let buffer = await fs.promises.readFile(file.path);
    const originalFormat = path.extname(file.originalname).toLowerCase().slice(1);

    // Se è un'immagine HEIC, convertila in JPG
    if (originalFormat === 'heic' || originalFormat === 'heif') {
      const outputBuffer = await heicConvert({ buffer, format: 'JPEG', quality: 0.92 }) as Buffer;
      buffer = outputBuffer;
    }

    // Crea la directory se non esiste
    const profileDir = path.join(MEDIA_BASE_PATH, 'profilo');
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    // Genera un nome file univoco
    const fileName = `profile_${Date.now()}_${uuidv4()}.webp`;
    const filePath = path.join(profileDir, fileName);

    //console.log('Saving to:', filePath);

    // Processa l'immagine con sharp
    await sharp(buffer)
      .rotate()
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 90,
        effort: 6
      })
      .toFile(filePath);

    // Verifica che il file sia stato creato correttamente
    if (!fs.existsSync(filePath)) {
      throw new Error('Il file non è stato creato correttamente');
    }

    // Verifica la dimensione del file
    const stats = await fs.promises.stat(filePath);
    if (stats.size === 0) {
      throw new Error('Il file creato è vuoto');
    }

    // Elimina il file temporaneo
    await fs.promises.unlink(file.path);

    // Restituisci il percorso relativo del file con il prefisso /media/
    const relativePath = `/media/profilo/${fileName}`;
    //console.log('Returning relative path:', relativePath);
    return relativePath;
  } catch (error) {
    console.error('Error processing profile picture:', error);

    // Pulisci il file temporaneo in caso di errore
    try {
      if (fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path);
      }
    } catch (cleanupError) {
      console.error('Errore pulizia file:', cleanupError);
    }

    throw error;
  }
} 