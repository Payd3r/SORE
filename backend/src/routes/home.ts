import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { Memory, Image } from '../types/db';
import { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';

interface Stats extends RowDataPacket {
  num_ricordi: number;
  num_foto: number;
  num_idee: number;
  num_luoghi: number;
}

const router = express.Router();

// Get home data
router.get('/', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;

    // Get statistics
    const [stats] = await pool.promise().query<Stats[]>(
      `SELECT 
        (SELECT COUNT(*) FROM memories WHERE couple_id = ?) as num_ricordi,
        (SELECT COUNT(*) FROM images WHERE couple_id = ?) as num_foto,
        (SELECT COUNT(*) FROM ideas WHERE couple_id = ?) as num_idee,
        (SELECT COUNT(*) FROM memories WHERE couple_id = ? AND location IS NOT NULL) as num_luoghi`,
      [coupleId, coupleId, coupleId, coupleId]
    );

    // Get random memories
    const [memories] = await pool.promise().query<Memory[]>(
      `SELECT 
        id,
        title,
        start_date as data_inizio,
        end_date as data_fine
       FROM memories 
       WHERE couple_id = ?
       ORDER BY RAND()
       LIMIT 3`,
      [coupleId]
    );

    // Get random images
    const [images] = await pool.promise().query<Image[]>(
      `SELECT 
        id,
        thumb_big_path,
        created_at
       FROM images 
       WHERE couple_id = ?
       ORDER BY RAND()
       LIMIT 6`,
      [coupleId]
    );

    // Process images to base64
    const processedImages = await Promise.all(images.map(async (image) => {
      try {
        return {
          id: image.id,
          created_at: image.created_at,
          image: image.thumb_big_path
        };
      } catch (error) {
        console.error(`Error processing image ${image.id}:`, error);
        return null;
      }
    }));

    // Filter out any failed image processing
    const validImages = processedImages.filter((img): img is NonNullable<typeof img> => img !== null);

    res.json({
      data: {
        num_ricordi: stats[0].num_ricordi,
        num_foto: stats[0].num_foto,
        num_idee: stats[0].num_idee,
        num_luoghi: stats[0].num_luoghi,
        Ricordi: memories,
        Images: validImages
      }
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

export default router; 