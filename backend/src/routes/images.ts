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
        i.type,
        IFNULL(i.memory_id, -1) as memory_id
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
      (
        `SELECT 
          i.id,
          i.webp_path,
          i.latitude,
          i.longitude,
          i.created_by_user_id,
          i.created_at,
          i.type,
          i.couple_id,
          i.display_order,
          u.name as created_by_name
        FROM images i 
        LEFT JOIN users u ON i.created_by_user_id = u.id 
        WHERE i.id = ?`
      ) as any,
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

    //console.log(`[Upload] Starting upload for ${req.files.length} images`);

    if (memoryId) {
      const [memoryResult] = await pool.promise().query<Memory[]>(
        'SELECT id FROM memories WHERE id = ? AND couple_id = ?',
        [memoryId, coupleId]
      );

      if (memoryResult.length === 0) {
        //console.log(`[Upload] Memory not found: ${memoryId}`);
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Upload] Error queuing file ${file.originalname}:`, errorMessage);
        return {
          success: false,
          file: file.originalname,
          error: errorMessage
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(r => r.success).length;
    //console.log(`[Upload] Queued ${successCount}/${results.length} images for processing`);

    res.status(202).json({ 
      message: 'Images queued for processing',
      data: results 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Upload] Error during upload:', errorMessage);
    res.status(500).json({ error: 'Failed to queue images for processing' });
  }
});

// Delete image
router.delete('/:imageId', auth, async (req: any, res) => {
  try {
    const { imageId } = req.params;
    const coupleId = req.user.coupleId;

    const [imageResult] = await pool.promise().query<Image[]>((
      'SELECT * FROM images WHERE id = ?'
    ) as any,
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
router.put('/:imageId/metadata', auth, async (req: any, res) => {
  try {
    const imageId = req.params.imageId;
    const coupleId = req.user.coupleId;
    const { type, created_at, display_order } = req.body;

    // LOG: input ricevuto
    console.log('[PUT /:imageId/metadata] body:', req.body);
    console.log('[PUT /:imageId/metadata] type:', type, 'created_at:', created_at, 'display_order:', display_order, 'typeof display_order:', typeof display_order);

    // Valida i dati in input manualmente
    if (!type || !Object.values(ImageType).includes(type)) {
      console.log('[PUT /:imageId/metadata] Validazione fallita: type non valido', type);
      return res.status(400).json({ error: "Il campo 'type' è mancante o non valido." });
    }
    if (!created_at || isNaN(Date.parse(created_at))) {
      console.log('[PUT /:imageId/metadata] Validazione fallita: created_at non valido', created_at);
      return res.status(400).json({ error: "Il campo 'created_at' è mancante o non è una data valida." });
    }
    if (display_order !== undefined && display_order !== null && isNaN(Number(display_order))) {
      console.log('[PUT /:imageId/metadata] Validazione fallita: display_order non valido', display_order, 'typeof:', typeof display_order);
      return res.status(400).json({ error: "display_order deve essere un numero o null" });
    }

    // Se display_order è 0, salvalo come null
    let displayOrderToSave = display_order;
    if (display_order === 0) {
      displayOrderToSave = null;
    }

    // Verifica che l'immagine esista e appartenga alla coppia
    const [images] = await pool.promise().query(
      'SELECT id FROM images WHERE id = ? AND couple_id = ?',
      [imageId, coupleId]
    );
    if (!images || (images as any[]).length === 0) {
      console.log('[PUT /:imageId/metadata] Immagine non trovata', imageId, coupleId);
      return res.status(404).json({ error: 'Immagine non trovata' });
    }

    // Aggiorna i metadati (incluso display_order se presente)
    let updateQuery = `UPDATE images SET type = ?, created_at = ?`;
    let updateParams: any[] = [type, created_at];
    if (display_order !== undefined) {
      updateQuery += `, display_order = ?`;
      updateParams.push(displayOrderToSave);
    }
    updateQuery += ` WHERE id = ? AND couple_id = ?`;
    updateParams.push(imageId, coupleId);

    console.log('[PUT /:imageId/metadata] Eseguo query:', updateQuery, updateParams);
    await pool.promise().query(updateQuery, updateParams);

    res.json({
      message: 'Metadati aggiornati con successo',
      data: {
        id: imageId,
        type,
        created_at,
        ...(display_order !== undefined ? { display_order: displayOrderToSave } : {})
      }
    });
  } catch (error) {
    console.error('Error updating image metadata:', error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dei metadati" });
  }
});

// Update only image type
router.put('/:imageId/type', auth, async (req: any, res) => {
  try {
    const imageId = req.params.imageId;
    const coupleId = req.user.coupleId;
    const { type } = req.body;

    // Valida il tipo in input
    if (!type) {
      //console.log(`[UpdateImageType] Validazione fallita - Type mancante`);
      return res.status(400).json({ error: 'Il campo \'type\' è mancante.' });
    }

    // Converti il tipo in minuscolo per confrontarlo con i valori dell'enum
    const normalizedType = type.toLowerCase();
    if (!Object.values(ImageType).includes(normalizedType as ImageType)) {
      //console.log(`[UpdateImageType] Validazione fallita - Type: ${type}, Type normalizzato: ${normalizedType}, Valori validi:`, Object.values(ImageType));
      return res.status(400).json({ error: 'Il campo \'type\' non è valido.' });
    }

    // Verifica che l'immagine esista e appartenga alla coppia  
    const [images] = await pool.promise().query((
      'SELECT id FROM images WHERE id = ? AND couple_id = ?'
    ) as any,
      [imageId, coupleId]
    );

    if (!images || (images as any[]).length === 0) {
      //console.log(`[UpdateImageType] Immagine non trovata o non autorizzata - ImageId: ${imageId}, CoupleId: ${coupleId}`);
      return res.status(404).json({ error: 'Immagine non trovata' });
    }
    
    // Aggiorna solo il tipo dell'immagine
    const [updateResult] = await pool.promise().query(
      `UPDATE images 
       SET type = ?
       WHERE id = ? AND couple_id = ?`,
      [normalizedType, imageId, coupleId]
    );

    res.json({ 
      message: 'Tipo immagine aggiornato con successo',
      data: {
        id: imageId,
        type
      }
    });

  } catch (error) {
    console.error('[UpdateImageType] Errore durante aggiornamento:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del tipo di immagine' });
  }
});

// Check image processing status
router.get('/status/:jobId', auth, async (req: any, res) => {
  try {
    const { jobId } = req.params;
    //console.log(`[Status] Checking status for job ${jobId}`);

    const jobState = await imageQueue.getJobState(jobId);
    const job = await imageQueue.getJob(jobId);

    if (!job) {
      //console.log(`[Status] Job not found: ${jobId}`);
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ 
      jobId,
      ...jobState,
      data: job.data
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Status] Error checking job status:', errorMessage);
    res.status(500).json({ error: 'Failed to check job status' });
  }
});

// Get queue status
router.get('/queue/status', auth, async (req: any, res) => {
  try {
    // Conta i file nelle diverse directory
    const processingFiles = fs.readdirSync(path.join(MEDIA_BASE_PATH, '../queue/processing'));
    const completedFiles = fs.readdirSync(path.join(MEDIA_BASE_PATH, '../queue/completed'));
    const failedFiles = fs.readdirSync(path.join(MEDIA_BASE_PATH, '../queue/failed'));

    // Conta i file in base al tipo di job
    const allFiles = [...processingFiles, ...completedFiles, ...failedFiles];
    
    // Ottieni informazioni sulla capacità parallela
    const activeJobsCount = imageQueue.getActiveJobsCount ? imageQueue.getActiveJobsCount() : processingFiles.length;
    const maxConcurrentJobs = imageQueue.getMaxConcurrentJobs ? imageQueue.getMaxConcurrentJobs() : 1;

    res.json({
      status: 'ok',
      queued: processingFiles.length,
      active: activeJobsCount,
      completed: completedFiles.length,
      failed: failedFiles.length,
      total: allFiles.length,
      maxConcurrentJobs,
      utilization: activeJobsCount > 0 ? Math.round((activeJobsCount / maxConcurrentJobs) * 100) : 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Queue Status] Error getting queue status:', errorMessage);
    res.status(500).json({ error: 'Failed to get queue status' });
  }
});

export default router;