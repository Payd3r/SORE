import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import path from 'path';
import fs from 'fs';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

interface MapImage extends RowDataPacket {
  id: number;
  lat: number;
  lon: number;
  thumb_small_path: string;
  thumb_big_path: string;
  country: string;
  created_at: string;
}

// Route per ottenere le immagini all'interno dei limiti geografici
router.get('/images/bounds', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;
    const { north, south, east, west } = req.query;

    // Validazione dei parametri
    if (!north || !south || !east || !west) {
      return res.status(400).json({
        error: 'Parametri mancanti',
        details: 'Sono richiesti i parametri: north, south, east, west'
      });
    }

    // Recupera le immagini all'interno dei limiti geografici
    const [images] = await pool.promise().query<MapImage[]>(
      `SELECT 
        i.id,
        i.latitude as lat,
        i.longitude as lon,
        i.thumb_small_path as small_thumb_path,
        i.thumb_big_path as thumb_big_path,
        i.country as country,
        i.created_at as created_at
      FROM images i
      WHERE i.couple_id = ? 
      AND i.latitude IS NOT NULL 
      AND i.longitude IS NOT NULL
      AND i.latitude BETWEEN ? AND ?
      AND i.longitude BETWEEN ? AND ?`,
      [coupleId, south, north, west, east]
    );

    //console.log('Immagini trovate nei limiti:', images.length);

    // Converti ogni immagine in base64
    const imagesWithBase64 = await Promise.all(
      images.map(async (image) => {
        try {
          const imagePath = path.join(__dirname, '../../', image.small_thumb_path);

          if (fs.existsSync(imagePath)) {
            const imageBuffer = await fs.promises.readFile(imagePath);
            const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
            const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

            return {
              id: image.id,
              lat: image.lat,
              lon: image.lon,
              thumb_small_path: image.thumb_small_path,
              thumb_big_path: image.thumb_big_path,
              country: image.country,
              created_at: image.created_at
            } as MapImage;
          }

          return null;
        } catch (error) {
          console.error(`Errore nella conversione dell'immagine ${image.id}:`, error);
          return null;
        }
      })
    );

    // Filtra eventuali immagini non convertite correttamente
    const validImages = imagesWithBase64.filter((img): img is MapImage => img !== null);
    //console.log('Immagini valide nei limiti:', validImages.length);

    res.json({
      success: true,
      data: validImages
    });

  } catch (error) {
    console.error('Errore nel recupero delle immagini per area:', error);
    res.status(500).json({
      error: 'Errore nel recupero delle immagini per area',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

// Route esistente per tutte le immagini
router.get('/images', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;
    //console.log('Couple ID:', coupleId);

    // Recupera tutte le immagini con coordinate per la coppia
    const [images] = await pool.promise().query<MapImage[]>(
      `SELECT 
        i.id,
        i.latitude as lat,
        i.longitude as lon,
        i.thumb_small_path as thumb_small_path,
        i.thumb_big_path as thumb_big_path,
        i.country as country,
        i.created_at as created_at
      FROM images i
      WHERE i.couple_id = ? 
      AND i.latitude IS NOT NULL 
      AND i.longitude IS NOT NULL`,
      [coupleId]
    );

    //console.log('Immagini trovate:', images.length);
    //console.log('Prima immagine:', images[0]);

    // Converti ogni immagine in base64
    const imagesValide = await Promise.all(
      images.map(async (image) => {
        try {
          return {
            id: image.id,
            lat: image.lat,
            lon: image.lon,
            thumb_small_path: image.thumb_small_path,
            thumb_big_path: image.thumb_big_path,
            country: image.country,
            created_at: image.created_at
          } as MapImage;
        } catch (error) {
          console.error(`Errore nella conversione dell'immagine ${image.id}:`, error);
          return null;
        }
      })
    );
    //console.log('Immagini valide:', imagesValide);
    res.json({
      success: true,
      data: imagesValide
    });
  } catch (error) {
    console.error('Errore nel recupero delle immagini per la mappa:', error);
    res.status(500).json({
      error: 'Errore nel recupero delle immagini per la mappa',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

// Route per ottenere le immagini di un memory specifico
router.get('/memory/:memoryId', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;
    const memoryId = req.params.memoryId;

    // Recupera le immagini del memory specifico
    const [images] = await pool.promise().query<MapImage[]>(
      `SELECT 
        i.id,
        i.latitude as lat,
        i.longitude as lon,
        i.thumb_small_path as thumb_small_path,
        i.thumb_big_path as thumb_big_path,
        i.country as country,
        i.created_at as created_at
      FROM images i
      WHERE i.couple_id = ? 
      AND i.memory_id = ?
      AND i.latitude IS NOT NULL 
      AND i.longitude IS NOT NULL`,
      [coupleId, memoryId]
    );

    // Converti ogni immagine in base64
    const imagesValide = await Promise.all(
      images.map(async (image) => {
        return {
          id: image.id,
          lat: image.lat,
          lon: image.lon,
          thumb_small_path: image.thumb_small_path,
          thumb_big_path: image.thumb_big_path,
          country: image.country,
          created_at: image.created_at
        } as MapImage;
      })
    );
   
    res.json({
      success: true,
      data: imagesValide
    });

  } catch (error) {
    console.error('Errore nel recupero delle immagini per memory:', error);
    res.status(500).json({
      error: 'Errore nel recupero delle immagini per memory',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

export default router; 