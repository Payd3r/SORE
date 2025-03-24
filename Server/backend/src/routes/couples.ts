import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { Couple } from '../types/db';

const router = express.Router();

// Get couple details
router.get('/:coupleId', auth, async (req: any, res) => {
  try {
    const coupleId = parseInt(req.params.coupleId, 10);

    // Verify user belongs to the couple
    if (req.user.coupleId !== coupleId) {
      return res.status(403).json({ error: 'Non autorizzato a visualizzare i dettagli di questa coppia' });
    }

    const [coupleResult] = await pool.promise().query<Couple[]>(
      'SELECT id, name, anniversary_date FROM couples WHERE id = ?',
      [coupleId]
    );

    if (coupleResult.length === 0) {
      return res.status(404).json({ error: 'Coppia non trovata' });
    }

    res.json({ data: coupleResult[0] });
  } catch (error) {
    console.error('Error fetching couple details:', error);
    res.status(500).json({ error: 'Errore nel recupero dei dettagli della coppia' });
  }
});

// Update couple details
router.put('/:coupleId', auth, async (req: any, res) => {
  try {
    const coupleId = parseInt(req.params.coupleId, 10);
    const { name, anniversaryDate } = req.body;

    // Verify user belongs to the couple
    if (req.user.coupleId !== coupleId) {
      return res.status(403).json({ error: 'Non autorizzato a modificare i dettagli di questa coppia' });
    }

    const [result] = await pool.promise().query(
      `UPDATE couples 
       SET name = IFNULL(?, name),
           anniversary_date = IFNULL(?, anniversary_date)
       WHERE id = ?`,
      [name, anniversaryDate, coupleId]
    );

    // Fetch updated couple
    const [coupleResult] = await pool.promise().query<Couple[]>(
      'SELECT id, name, anniversary_date FROM couples WHERE id = ?',
      [coupleId]
    );

    res.json({ data: coupleResult[0] });
  } catch (error) {
    console.error('Error updating couple details:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento dei dettagli della coppia' });
  }
});

export default router; 