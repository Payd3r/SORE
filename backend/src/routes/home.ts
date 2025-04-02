import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { Memory, Image, Idea } from '../types/db';
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

    // Get random memories with their associated images
    const [memories] = await pool.promise().query<Memory[]>(
      `SELECT 
        m.id,
        m.title,
        m.start_date as data_inizio,
        m.end_date as data_fine,
        i.thumb_big_path as image
       FROM memories m
       LEFT JOIN images i ON i.memory_id = m.id
       WHERE m.couple_id = ?
       GROUP BY m.id
       ORDER BY RAND()
       LIMIT 6`,
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

    // Get latest completed ideas
    const [ideas] = await pool.promise().query<Idea[]>(
      `SELECT 
        id,
        title,
        description,
        created_at,
        date_checked
       FROM ideas 
       WHERE couple_id = ? AND date_checked IS NOT NULL
       ORDER BY date_checked DESC
       LIMIT 5`,
      [coupleId]
    );

    // Get latest songs from memories
    const [songs] = await pool.promise().query<Memory[]>(
      `SELECT 
        song as title       
       FROM memories 
       WHERE couple_id = ? 
       AND song IS NOT NULL 
       AND song != ''       
       LIMIT 3`,
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
        Images: validImages,
        Ideas: ideas,
        Songs: songs
      }
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

export default router; 