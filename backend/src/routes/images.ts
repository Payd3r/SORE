import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';
import { auth } from '../middleware/auth';
import { DbRow, Image, ResultSetHeader, ImageType, Memory } from '../types/db';
import { processImage, deleteImageFiles } from '../services/imageProcessor';
import imageQueue from '../config/bull';

const router = express.Router();

// Definisci il percorso base per le immagini (relativo alla cartella backend)
const MEDIA_BASE_PATH = 'media';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(MEDIA_BASE_PATH, 'temp');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accetta qualsiasi tipo di file
    cb(null, true);
  }
});

// Get all images for a couple
router.get('/', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;
    const userId = req.user.id;

    const [images] = await pool.promise().query<Image[]>(
      `SELECT 
        i.id,       
        i.thumb_big_path,        
        i.created_at,
        i.type
      FROM images i      
      WHERE i.couple_id = ?
      ORDER BY i.created_at DESC`,
      [coupleId]
    );

    res.json({ data: images });
  } catch (error) {
    console.error('Errore recupero immagini:', error);
    res.status(500).json({ error: 'Impossibile recuperare le immagini' });
  }
});

// Get a single image
router.get('/:imageId', auth, async (req: any, res) => {
  try {
    const { imageId } = req.params;
    const coupleId = req.user.coupleId;

    const [rows] = await pool.promise().query<Image[]>(
      `SELECT 
        i.id,
        i.jpg_path,
        i.latitude,
        i.longitude,
        i.created_by_user_id,
        i.created_at,
        i.type,
        i.couple_id,
        u.name as created_by_name
      FROM images i 
      LEFT JOIN users u ON i.created_by_user_id = u.id 
      WHERE i.id = ?`,
      [imageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = rows[0];

    if (req.user.coupleId !== image.couple_id) {
      return res.status(403).json({ error: 'Not authorized to view this image' });
    }

    res.json({ data: image });
  } catch (error) {
    console.error('Errore recupero immagine:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Upload images
router.post('/upload', auth, upload.array('images', 300), async (req: any, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const coupleId = req.user.coupleId;
    const userId = req.user.id;
    const memoryId = req.body.memory_id || req.body.memoryId || req.body['memory_id'];
    const type = req.body.type;

    console.log(`[Upload] Starting upload for ${req.files.length} images`);

    if (memoryId) {
      const [memoryResult] = await pool.promise().query<Memory[]>(
        'SELECT id FROM memories WHERE id = ? AND couple_id = ?',
        [memoryId, coupleId]
      );

      if (memoryResult.length === 0) {
        console.log(`[Upload] Memory not found: ${memoryId}`);
        return res.status(404).json({ error: 'Memory not found or unauthorized' });
      }
    }

    // Aggiungi i job alla coda
    const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
      try {
        const job = await imageQueue.add({
          filePath: file.path,
          originalName: file.originalname,
          memoryId: memoryId ? parseInt(memoryId) : null,
          coupleId,
          userId,
          type
        });

        return {
          success: true,
          file: file.originalname,
          jobId: job.id,
          status: 'queued'
        };
      } catch (error) {
        console.error(`[Upload] Error queuing file ${file.originalname}:`, error instanceof Error ? error.message : 'Unknown error');
        return {
          success: false,
          file: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`[Upload] Queued ${successCount}/${results.length} images for processing`);

    res.status(202).json({ 
      message: 'Images queued for processing',
      data: results 
    });
  } catch (error) {
    console.error('[Upload] Error during upload:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to queue images for processing' });
  }
});

// Delete image
router.delete('/:imageId', auth, async (req: any, res) => {
  try {
    const { imageId } = req.params;
    const coupleId = req.user.coupleId;

    const [imageResult] = await pool.promise().query<Image[]>(
      'SELECT * FROM images WHERE id = ?',
      [imageId]
    );

    if (imageResult.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult[0];

    if (req.user.coupleId !== image.couple_id) {
      return res.status(403).json({ error: 'Not authorized to delete this image' });
    }

    deleteImageFiles({
      original_path: image.original_path,
      webp_path: image.webp_path,
      thumb_big_path: image.thumb_big_path,
      thumb_small_path: image.thumb_small_path,
      original_format: image.original_format,
      metadata: {
        taken_at: image.taken_at,
        latitude: image.latitude || undefined,
        longitude: image.longitude || undefined,
        type: image.type || ImageType.LANDSCAPE,
        country: image.country || undefined
      }
    });

    const [result] = await pool.promise().query<ResultSetHeader>('DELETE FROM images WHERE id = ?', [imageId]);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Errore eliminazione immagine:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Update image metadata
router.patch('/:imageId', auth, async (req: any, res) => {
  try {
    const { imageId } = req.params;
    const {
      description,
      latitude,
      longitude,
      location,
      taken_at,
      type
    } = req.body;
    const coupleId = req.user.coupleId;

    const [imageResult] = await pool.promise().query<Image[]>(
      'SELECT * FROM images WHERE id = ?',
      [imageId]
    );

    if (imageResult.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult[0];

    if (req.user.coupleId !== image.couple_id) {
      return res.status(403).json({ error: 'Not authorized to update this image' });
    }

    const [result] = await pool.promise().query<ResultSetHeader>(
      `UPDATE images 
       SET description = ?,
           latitude = ?,
           longitude = ?,
           location = ?,
           taken_at = ?,
           type = ?
       WHERE id = ?`,
      [
        description || null,
        latitude || null,
        longitude || null,
        location || null,
        taken_at || image.taken_at,
        type || image.type,
        imageId
      ]
    );

    const [updatedImage] = await pool.promise().query<Image[]>(
      `SELECT i.*, u.name as created_by_name, m.title as memory_title 
       FROM images i 
       LEFT JOIN users u ON i.created_by_user_id = u.id 
       LEFT JOIN memories m ON i.memory_id = m.id 
       WHERE i.id = ?`,
      [imageId]
    );

    res.json({ data: updatedImage[0] });
  } catch (error) {
    console.error('Errore aggiornamento metadata:', error);
    res.status(500).json({ error: 'Failed to update image metadata' });
  }
});

// Check image processing status
router.get('/status/:jobId', auth, async (req: any, res) => {
  try {
    const { jobId } = req.params;
    console.log(`[Status] Checking status for job ${jobId}`);

    const state = await imageQueue.getJobState(jobId);
    const job = await imageQueue.getJob(jobId);

    if (!job) {
      console.log(`[Status] Job not found: ${jobId}`);
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ 
      jobId,
      state,
      data: job.data
    });
  } catch (error) {
    console.error('[Status] Error checking job status:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to check job status' });
  }
});

export default router;