import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { User } from '../types/db';

const router = express.Router();

// Get user profile
router.get('/:userId', auth, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    // Verify user is requesting their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a visualizzare questo profilo' });
    }

    const [userResult] = await pool.promise().query<User[]>(
      'SELECT id, name, email, couple_id, theme_preference, profile_picture_url FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ data: userResult[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Errore nel recupero del profilo utente' });
  }
});

// Update user profile
router.put('/:userId', auth, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { name, email, profilePicture, themePreference } = req.body;

    // Verify user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a modificare questo profilo' });
    }

    const [result] = await pool.promise().query(
      `UPDATE users 
       SET name = IFNULL(?, name),
           email = IFNULL(?, email),
           profile_picture_url = IFNULL(?, profile_picture_url),
           theme_preference = IFNULL(?, theme_preference)
       WHERE id = ?`,
      [name, email, profilePicture, themePreference, userId]
    );

    // Fetch updated user
    const [userResult] = await pool.promise().query<User[]>(
      'SELECT id, name, email, couple_id, theme_preference, profile_picture_url FROM users WHERE id = ?',
      [userId]
    );

    res.json({ data: userResult[0] });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del profilo utente' });
  }
});

export default router; 