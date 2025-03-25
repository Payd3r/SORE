import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';
import { auth } from '../middleware/auth';
import { DbRow, Image, ResultSetHeader, ImageType } from '../types/db';
import { processImage, deleteImageFiles } from '../services/imageProcessor';

const router = express.Router();

// Definisci il percorso base per le immagini (relativo alla cartella backend)
const MEDIA_BASE_PATH = 'media';

// Funzione helper per convertire un file in base64
async function fileToBase64(filePath: string): Promise<string> {
  try {
    // Normalizza il percorso rimuovendo eventuali prefissi /media/ o media\
    let cleanPath = filePath;
    if (cleanPath.startsWith('/media/')) {
      cleanPath = cleanPath.substring(7);
    } else if (cleanPath.startsWith('media\\') || cleanPath.startsWith('media/')) {
      cleanPath = cleanPath.substring(6);
    }
    
    const absolutePath = path.join(process.cwd(), MEDIA_BASE_PATH, cleanPath);
    
    console.log('Tentativo di lettura file:', {
      filePath,
      cleanPath,
      absolutePath,
      exists: fs.existsSync(absolutePath)
    });

    if (!fs.existsSync(absolutePath)) {
      console.error(`File non trovato: ${absolutePath}`);
      return ''; // Ritorna una stringa vuota se il file non esiste
    }
    const buffer = await fs.promises.readFile(absolutePath);
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error(`Errore nella lettura del file ${filePath}:`, error);
    return ''; // Ritorna una stringa vuota in caso di errore
  }
}

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/heic'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and HEIC are allowed.'));
    }
  }
});

// Get all images for a couple
router.get('/couples/:coupleId/images', auth, async (req: any, res) => {
  try {
    const coupleId = parseInt(req.params.coupleId, 10);

    // Verify user belongs to the couple
    if (req.user.coupleId !== coupleId) {
      return res.status(403).json({ error: 'Not authorized to view these images' });
    }

    const [images] = await pool.promise().query<Image[]>(
      `SELECT 
        i.id,
        i.original_format,
        i.original_path,
        i.jpg_path,
        i.thumb_big_path,
        i.thumb_small_path,
        i.taken_at,
        i.latitude,
        i.longitude,
        i.location_name,
        i.location_address,
        i.description,
        i.memory_id,
        i.couple_id,
        i.created_by_user_id,
        i.created_at,
        i.type,
        u.name as created_by_name,
        m.title as memory_title
      FROM images i
      LEFT JOIN users u ON i.created_by_user_id = u.id
      LEFT JOIN memories m ON i.memory_id = m.id
      WHERE i.couple_id = ?
      ORDER BY i.created_at DESC`,
      [coupleId]
    );

    console.log(`Trovate ${images.length} immagini per la coppia ${coupleId}`);

    // Converti le immagini in base64
    const imagesWithBase64 = await Promise.all(
      images.map(async (image) => {
        const thumbBigBase64 = await fileToBase64(image.thumb_big_path);
        return {
          ...image,
          thumb_big_path: thumbBigBase64 || null,
        };
      })
    );

    // Filtra le immagini che non hanno una thumbnail valida
    const validImages = imagesWithBase64.filter(image => image.thumb_big_path !== null);
    console.log(`Immagini valide dopo la conversione: ${validImages.length}`);

    res.json({ data: validImages });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get a single image
router.get('/images/:imageId', auth, async (req: any, res) => {
  try {
    const { imageId } = req.params;

    const [rows] = await pool.promise().query<Image[]>(
      `SELECT 
        i.id,
        i.original_format,
        i.original_path,
        i.jpg_path,
        i.thumb_big_path,
        i.thumb_small_path,
        i.taken_at,
        i.latitude,
        i.longitude,
        i.location_name,
        i.location_address,
        i.description,
        i.memory_id,
        i.couple_id,
        i.created_by_user_id,
        i.created_at,
        i.type,
        u.name as created_by_name,
        m.title as memory_title
      FROM images i 
      LEFT JOIN users u ON i.created_by_user_id = u.id 
      LEFT JOIN memories m ON i.memory_id = m.id 
      WHERE i.id = ?`,
      [imageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = rows[0];

    // Verify user belongs to the couple that owns the image
    if (req.user.coupleId !== image.couple_id) {
      return res.status(403).json({ error: 'Not authorized to view this image' });
    }

    console.log(`Recuperata immagine ${imageId} per la coppia ${image.couple_id}`);

    // Converti tutte le versioni dell'immagine in base64
    const [originalBase64, jpgBase64, thumbBigBase64, thumbSmallBase64] = await Promise.all([
      fileToBase64(image.original_path),
      fileToBase64(image.jpg_path),
      fileToBase64(image.thumb_big_path),
      fileToBase64(image.thumb_small_path),
    ]);

    console.log(`Dimensioni base64 per immagine ${imageId}:`, {
      original: originalBase64.length,
      jpg: jpgBase64.length,
      thumbBig: thumbBigBase64.length,
      thumbSmall: thumbSmallBase64.length
    });

    const imageWithBase64 = {
      ...image,
      original_path: originalBase64,
      jpg_path: jpgBase64,
      thumb_big_path: thumbBigBase64,
      thumb_small_path: thumbSmallBase64,
    };

    res.json({ data: imageWithBase64 });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Upload image
router.post('/couples/:coupleId/images', auth, upload.single('image'), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const coupleId = parseInt(req.params.coupleId, 10);

    // Verify user belongs to the couple
    if (req.user.coupleId !== coupleId) {
      return res.status(403).json({ error: 'Not authorized to upload to this couple' });
    }

    const { memoryId, type } = req.body;

    // Process the image
    const processedImage = await processImage(req.file);
    
    // Override the type if provided in the request
    if (type && Object.values(ImageType).includes(type)) {
      processedImage.metadata.type = type;
    }

    // Save to database
    const [result] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO images (
        url,
        original_format,
        original_path,
        jpg_path,
        thumb_big_path,
        thumb_small_path,
        taken_at,
        latitude,
        longitude,
        location_name,
        location_address,
        description,
        memory_id,
        couple_id,
        created_by_user_id,
        type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        processedImage.jpg_path,
        processedImage.original_format,
        processedImage.original_path,
        processedImage.jpg_path,
        processedImage.thumb_big_path,
        processedImage.thumb_small_path,
        processedImage.metadata.taken_at,
        processedImage.metadata.latitude || null,
        processedImage.metadata.longitude || null,
        processedImage.metadata.location_name || null,
        processedImage.metadata.location_address || null,
        null,
        memoryId || null,
        coupleId,
        req.user.id,
        processedImage.metadata.type
      ]
    );

    const imageId = result.insertId;

    // Fetch the created image
    const [rows] = await pool.promise().query<Image[]>(
      `SELECT i.*, u.name as created_by_name, m.title as memory_title 
       FROM images i 
       LEFT JOIN users u ON i.created_by_user_id = u.id 
       LEFT JOIN memories m ON i.memory_id = m.id 
       WHERE i.id = ?`,
      [imageId]
    );

    // Clean up temp file
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (error) {
      console.error('Error deleting temp file:', error);
      // Non blocchiamo la risposta se il file temporaneo non può essere eliminato
    }

    res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error('Error uploading image:', error);
    // Clean up temp file if there was an error
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkError) {
      console.error('Error deleting temp file after error:', unlinkError);
    }
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete image
router.delete('/images/:imageId', auth, async (req: any, res) => {
  try {
    const { imageId } = req.params;

    // Get image details
    const [imageResult] = await pool.promise().query<Image[]>(
      'SELECT * FROM images WHERE id = ?',
      [imageId]
    );

    if (imageResult.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult[0];

    // Verify user belongs to the couple that owns the image
    if (req.user.coupleId !== image.couple_id) {
      return res.status(403).json({ error: 'Not authorized to delete this image' });
    }

    // Delete the files
    deleteImageFiles({
      original_path: image.original_path,
      jpg_path: image.jpg_path,
      thumb_big_path: image.thumb_big_path,
      thumb_small_path: image.thumb_small_path,
      original_format: image.original_format,
      metadata: {
        taken_at: image.taken_at,
        latitude: image.latitude || undefined,
        longitude: image.longitude || undefined,
        location_name: image.location_name || undefined,
        location_address: image.location_address || undefined,
        type: image.type || ImageType.LANDSCAPE // Imposta un valore predefinito se type è undefined
      }
    });

    // Delete from database
    await pool.promise().query<ResultSetHeader>('DELETE FROM images WHERE id = ?', [imageId]);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Update image metadata
router.patch('/images/:imageId', auth, async (req: any, res) => {
  try {
    const { imageId } = req.params;
    const {
      description,
      latitude,
      longitude,
      location_name,
      location_address,
      taken_at,
      type
    } = req.body;

    // Get image details
    const [imageResult] = await pool.promise().query<Image[]>(
      'SELECT * FROM images WHERE id = ?',
      [imageId]
    );

    if (imageResult.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult[0];

    // Verify user belongs to the couple that owns the image
    if (req.user.coupleId !== image.couple_id) {
      return res.status(403).json({ error: 'Not authorized to update this image' });
    }

    // Update image metadata
    await pool.promise().query(
      `UPDATE images 
       SET description = ?,
           latitude = ?,
           longitude = ?,
           location_name = ?,
           location_address = ?,
           taken_at = ?,
           type = ?
       WHERE id = ?`,
      [
        description || null,
        latitude || null,
        longitude || null,
        location_name || null,
        location_address || null,
        taken_at || image.taken_at,
        type || image.type,
        imageId
      ]
    );

    // Fetch updated image
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
    console.error('Error updating image metadata:', error);
    res.status(500).json({ error: 'Failed to update image metadata' });
  }
});

export default router;