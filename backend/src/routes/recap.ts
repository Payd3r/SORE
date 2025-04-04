import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

interface RecapStats extends RowDataPacket {
  tot_ricordi: number;
  tot_foto: number;
  tot_idee: number;
  tot_luoghi: number;
  tot_ricordi_viaggi: number;
  tot_ricordi_eventi: number;
  tot_ricordi_semplici: number;
  tot_idee_checked: number;
  tot_idee_unchecked: number;
  tot_foto_paesaggi: number;
  tot_foto_coppia: number;
  tot_foto_singolo: number;
}

interface UserStats extends RowDataPacket {
  id_utente: number;
  nome_utente: string;
  tot_ricordi_creati: number;
  tot_images_create: number;
  tot_idee_create: number;
}

const router = express.Router();

// Get recap data
router.get('/', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;

    // Get comprehensive statistics
    const [stats] = await pool.promise().query<RecapStats[]>(
      `SELECT 
        (SELECT COUNT(*) FROM memories WHERE couple_id = ?) as tot_ricordi,
        (SELECT COUNT(*) FROM images WHERE couple_id = ?) as tot_foto,
        (SELECT COUNT(*) FROM ideas WHERE couple_id = ?) as tot_idee,
        (SELECT COUNT(DISTINCT location) FROM memories WHERE couple_id = ? AND location IS NOT NULL) as tot_luoghi,
        (SELECT COUNT(*) FROM memories WHERE couple_id = ? AND type = 'viaggio') as tot_ricordi_viaggi,
        (SELECT COUNT(*) FROM memories WHERE couple_id = ? AND type = 'evento') as tot_ricordi_eventi,
        (SELECT COUNT(*) FROM memories WHERE couple_id = ? AND type = 'semplice') as tot_ricordi_semplici,
        (SELECT COUNT(*) FROM ideas WHERE couple_id = ? AND checked = true) as tot_idee_checked,
        (SELECT COUNT(*) FROM ideas WHERE couple_id = ? AND checked = false) as tot_idee_unchecked,
        (SELECT COUNT(*) FROM images WHERE couple_id = ? AND type = 'paesaggio') as tot_foto_paesaggi,
        (SELECT COUNT(*) FROM images WHERE couple_id = ? AND type = 'coppia') as tot_foto_coppia,
        (SELECT COUNT(*) FROM images WHERE couple_id = ? AND type = 'singolo') as tot_foto_singolo`,
      [coupleId, coupleId, coupleId, coupleId, coupleId, coupleId, coupleId, coupleId, coupleId, coupleId, coupleId, coupleId]
    );

    // Get last 5 unique locations
    const [luoghi] = await pool.promise().query(
      `SELECT DISTINCT 
        location,
        start_date
       FROM memories
       WHERE couple_id = ? AND location IS NOT NULL
       ORDER BY start_date DESC
       LIMIT 5`,
      [coupleId]
    );

    // Get last 8 unique songs
    const [canzoni] = await pool.promise().query(
      `SELECT DISTINCT 
        song,
        start_date
       FROM memories
       WHERE couple_id = ? AND song IS NOT NULL
       ORDER BY start_date DESC
       LIMIT 8`,
      [coupleId]
    );

    res.json({
      data: {
        statistics: stats[0],
        luoghi,
        canzoni
      }
    });
  } catch (error) {
    console.error('Error fetching recap data:', error);
    res.status(500).json({ error: 'Failed to fetch recap data' });
  }
});

// Get comparison data
router.get('/confronto', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;

    // Get total statistics for the couple
    const [totals] = await pool.promise().query<RowDataPacket[]>(
      `SELECT 
        (SELECT COUNT(*) FROM memories WHERE couple_id = ?) as tot_ricordi,
        (SELECT COUNT(*) FROM images WHERE couple_id = ?) as tot_images,
        (SELECT COUNT(*) FROM ideas WHERE couple_id = ?) as tot_idee`,
      [coupleId, coupleId, coupleId]
    );

    // Get statistics per user
    const [userStats] = await pool.promise().query<UserStats[]>(
      `SELECT 
        u.id as id_utente,
        u.name as nome_utente,
        (SELECT COUNT(*) FROM memories WHERE couple_id = ? AND created_by_user_id = u.id) as tot_ricordi_creati,
        (SELECT COUNT(*) FROM images WHERE couple_id = ? AND created_by_user_id = u.id) as tot_images_create,
        (SELECT COUNT(*) FROM ideas WHERE couple_id = ? AND created_by_user_id = u.id) as tot_idee_create
       FROM users u
       WHERE u.couple_id = ?`,
      [coupleId, coupleId, coupleId, coupleId]
    );

    res.json({
      data: {
        totals: totals[0],
        users: userStats
      }
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// Get activity data
router.get('/attivita', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;

    // Get last images by type
    const [images] = await pool.promise().query(
      `(SELECT i.id, i.thumb_big_path, i.type, u.name as created_by_user_name
        FROM images i
        JOIN users u ON i.created_by_user_id = u.id
        WHERE i.couple_id = ? AND i.type = 'coppia' 
        ORDER BY i.id DESC LIMIT 6)
       UNION ALL
       (SELECT i.id, i.thumb_big_path, i.type, u.name as created_by_user_name
        FROM images i
        JOIN users u ON i.created_by_user_id = u.id
        WHERE i.couple_id = ? AND i.type = 'singolo' 
        ORDER BY i.id DESC LIMIT 4)
       UNION ALL
       (SELECT i.id, i.thumb_big_path, i.type, u.name as created_by_user_name
        FROM images i
        JOIN users u ON i.created_by_user_id = u.id
        WHERE i.couple_id = ? AND i.type = 'paesaggio' 
        ORDER BY i.id DESC LIMIT 6)
       ORDER BY type, id DESC`,
      [coupleId, coupleId, coupleId]
    );

    // Get last memories by type
    const [memories] = await pool.promise().query(
      `(SELECT m.id, m.type, m.start_date, m.end_date, 
              (SELECT thumb_big_path FROM images 
               WHERE memory_id = m.id 
               ORDER BY id DESC LIMIT 1) as thumb_big_path,
              u.name as created_by_user_name
        FROM memories m
        JOIN users u ON m.created_by_user_id = u.id
        WHERE m.couple_id = ? AND m.type = 'viaggio'
        ORDER BY m.id DESC LIMIT 2)
       UNION ALL
       (SELECT m.id, m.type, m.start_date, m.end_date,
              (SELECT thumb_big_path FROM images 
               WHERE memory_id = m.id 
               ORDER BY id DESC LIMIT 1) as thumb_big_path,
              u.name as created_by_user_name
        FROM memories m
        JOIN users u ON m.created_by_user_id = u.id
        WHERE m.couple_id = ? AND m.type = 'evento'
        ORDER BY m.id DESC LIMIT 2)
       UNION ALL
       (SELECT m.id, m.type, m.start_date, m.end_date,
              (SELECT thumb_big_path FROM images 
               WHERE memory_id = m.id 
               ORDER BY id DESC LIMIT 1) as thumb_big_path,
              u.name as created_by_user_name
        FROM memories m
        JOIN users u ON m.created_by_user_id = u.id
        WHERE m.couple_id = ? AND m.type = 'semplice'
        ORDER BY m.id DESC LIMIT 2)
       ORDER BY type, id DESC`,
      [coupleId, coupleId, coupleId]
    );

    res.json({
      data: {
        images,
        memories
      }
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

export default router; 