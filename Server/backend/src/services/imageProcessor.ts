import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import exifr from 'exifr';
import heicConvert from 'heic-convert';
import { ImageType } from '../types/db';

// Definisci il percorso base per le immagini (relativo alla cartella backend)
const MEDIA_BASE_PATH = 'media';

interface ImageMetadata {
  taken_at: Date;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  location_address?: string;
  type: ImageType;
}

interface ProcessedImage {
  id: string;
  original_format: string;
  original_path: string;
  jpg_path: string;
  thumb_big_path: string;
  thumb_small_path: string;
  metadata: ImageMetadata;
}

interface ImageFilesToDelete {
  original_path: string;
  jpg_path: string;
  thumb_big_path: string;
  thumb_small_path: string;
  original_format: string;
  metadata: ImageMetadata;
}

export async function processImage(file: Express.Multer.File): Promise<ProcessedImage> {
  const imageId = uuidv4();
  const imageDir = path.join(MEDIA_BASE_PATH, imageId);
  const originalFormat = path.extname(file.originalname).toLowerCase().slice(1);

  // Crea la directory per l'immagine
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Leggi il file
  const buffer = await fs.promises.readFile(file.path);

  // Estrai i metadati
  const metadata = await extractMetadata(buffer, originalFormat);

  // Salva l'immagine originale
  const originalPath = path.join(imageDir, `original.${originalFormat}`);
  await fs.promises.writeFile(originalPath, buffer);

  // Converti in JPG se necessario
  let jpgBuffer: Buffer;
  if (originalFormat === 'heic') {
    jpgBuffer = await heicConvert(buffer);
  } else {
    jpgBuffer = await sharp(buffer).jpeg().toBuffer();
  }
  const jpgPath = path.join(imageDir, 'image.jpg');
  await fs.promises.writeFile(jpgPath, jpgBuffer);

  // Crea le thumbnail
  const thumbBigBuffer = await sharp(jpgBuffer)
    .resize(400, 400, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  const thumbBigPath = path.join(imageDir, 'thumb_big.jpg');
  await fs.promises.writeFile(thumbBigPath, thumbBigBuffer);

  const thumbSmallBuffer = await sharp(jpgBuffer)
    .resize(200, 200, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  const thumbSmallPath = path.join(imageDir, 'thumb_small.jpg');
  await fs.promises.writeFile(thumbSmallPath, thumbSmallBuffer);

  // Elimina il file temporaneo
  await fs.promises.unlink(file.path);

  return {
    id: imageId,
    original_format: originalFormat,
    original_path: originalPath,
    jpg_path: jpgPath,
    thumb_big_path: thumbBigPath,
    thumb_small_path: thumbSmallPath,
    metadata: {
      ...metadata,
    }
  };
}

async function extractMetadata(buffer: Buffer, format: string): Promise<ImageMetadata> {
  try {
    const exif = await exifr.parse(buffer);
    const taken_at = exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal) : new Date();
    
    return {
      taken_at,
      latitude: exif?.latitude,
      longitude: exif?.longitude,
      location_name: undefined,
      location_address: undefined,
      type: ImageType.COUPLE // Default type that can be overridden during upload
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      taken_at: new Date(),
      type: ImageType.COUPLE // Default type
    };
  }
}

export async function deleteImageFiles(files: ImageFilesToDelete): Promise<void> {
  const filesToDelete = [
    files.original_path,
    files.jpg_path,
    files.thumb_big_path,
    files.thumb_small_path,
  ];

  for (const file of filesToDelete) {
    try {
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
      }
    } catch (error) {
      console.error(`Errore nell'eliminazione del file ${file}:`, error);
    }
  }

  const dir = path.dirname(files.original_path);
  try {
    if (fs.existsSync(dir)) {
      await fs.promises.rmdir(dir);
    }
  } catch (error) {
    console.error(`Errore nell'eliminazione della directory ${dir}:`, error);
  }
} 