import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { Couple } from '../types/db';

const router = express.Router();

// Get couple details
router.get('/:coupleId', auth, async (req: any, res) => {
  //console.log('=== COUPLES ROUTE ===');
  //console.log('Route /:coupleId chiamata con ID:', req.params.coupleId);
  //console.log('User:', req.user);
  try {
    const coupleId = parseInt(req.params.coupleId, 10);
    const userCoupleId = parseInt(req.user.coupleId, 10);
    //console.log('coupleId convertito:', coupleId);
    //console.log('userCoupleId convertito:', userCoupleId);

    // Verify user belongs to the couple
    if (userCoupleId !== coupleId) {
      //console.log('Utente non autorizzato:', userCoupleId, 'vs', coupleId);
      return res.status(403).json({ error: 'Non autorizzato a visualizzare i dettagli di questa coppia' });
    }

    const [coupleResult] = await pool.promise().query<any[]>(
      `SELECT 
        c.id, 
        c.name, 
        c.anniversary_date,
        COALESCE((SELECT COUNT(*) FROM images WHERE couple_id = c.id), 0) as num_foto,
        COALESCE((SELECT COUNT(*) FROM ideas WHERE couple_id = c.id), 0) as num_idee,
        COALESCE((SELECT COUNT(*) FROM memories WHERE couple_id = c.id), 0) as num_ricordi
      FROM couples c
      WHERE c.id = ?`,
      [coupleId]
    );

    //console.log('Risultato query:', coupleResult);

    if (!coupleResult || coupleResult.length === 0) {
      //console.log('Coppia non trovata');
      return res.status(404).json({ error: 'Coppia non trovata' });
    }

    // Recupera i membri della coppia
    const [membersResult] = await pool.promise().query<any[]>(
      `SELECT name, email 
       FROM users 
       WHERE couple_id = ?`,
      [coupleId]
    );

    //console.log('Membri trovati:', membersResult);

    const response = { 
      data: {
        ...coupleResult[0],
        membri: membersResult
      }
    };

    //console.log('Risposta finale:', response);
    res.json(response);
  } catch (error) {
    console.error('Errore nel recupero dei dettagli della coppia:', error);
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

    // Fetch updated couple with all details
    const [coupleResult] = await pool.promise().query<any[]>(
      `SELECT 
        c.id, 
        c.name, 
        c.anniversary_date,
        COALESCE((SELECT COUNT(*) FROM images WHERE couple_id = c.id), 0) as num_foto,
        COALESCE((SELECT COUNT(*) FROM ideas WHERE couple_id = c.id), 0) as num_idee,
        COALESCE((SELECT COUNT(*) FROM memories WHERE couple_id = c.id), 0) as num_ricordi
      FROM couples c
      WHERE c.id = ?`,
      [coupleId]
    );

    if (!coupleResult || coupleResult.length === 0) {
      return res.status(404).json({ error: 'Coppia non trovata' });
    }

    // Recupera i membri della coppia
    const [membersResult] = await pool.promise().query<any[]>(
      `SELECT name, email 
       FROM users 
       WHERE couple_id = ?`,
      [coupleId]
    );

    const response = { 
      data: {
        ...coupleResult[0],
        membri: membersResult
      }
    };

    //console.log('Risposta couple:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error updating couple details:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento dei dettagli della coppia' });
  }
});

export default router; 