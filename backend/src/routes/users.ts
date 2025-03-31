import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { User } from '../types/db';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { processImage, processProfilePicture } from '../services/imageProcessor';

const router = express.Router();

// Configurazione multer per il caricamento temporaneo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join('media', 'temp');
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

// Configurazione multer per la foto profilo
const profilePictureUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter - File:', file);
    // Accetta solo immagini
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo le immagini sono permesse'));
    }
  }
}).single('profile_picture');


// Modifica password
router.put('/edit-password', auth, async (req: any, res) => {
  console.log('=== EDIT PASSWORD ROUTE ===');
  console.log('Request body:', req.body);
  console.log('User from token:', req.user);
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user.id;

    // Validazione input
    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Vecchia password e nuova password sono obbligatorie' });
    }

    // Recupera l'utente e la sua password hash
    const [userResult] = await pool.promise().query<User[]>(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Verifica che la vecchia password sia corretta
    const isMatch = await bcrypt.compare(old_password, userResult[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Vecchia password non corretta' });
    }

    // Hash della nuova password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_password, salt);

    // Aggiorna la password nel database
    await pool.promise().query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password aggiornata con successo'
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento della password:', error);
    res.status(500).json({
      error: 'Errore nell\'aggiornamento della password',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

// Modifica foto profilo
router.put('/profile-picture', auth, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const base64Data = req.body.profile_picture;

    if (!base64Data) {
      return res.status(400).json({
        error: 'Nessuna immagine caricata',
        details: 'Il campo profile_picture è obbligatorio'
      });
    }

    // Recupera l'utente per ottenere il percorso della vecchia foto
    const [userResult] = await pool.promise().query<User[]>(
      'SELECT profile_picture_url FROM users WHERE id = ?',
      [userId]
    );

    // Se esiste una vecchia foto, eliminala
    if (userResult[0]?.profile_picture_url) {
      const oldImagePath = path.join(process.cwd(), userResult[0].profile_picture_url);
      if (fs.existsSync(oldImagePath)) {
        await fs.promises.unlink(oldImagePath);
        console.log('Vecchia foto profilo eliminata:', oldImagePath);
      }
    }

    // Rimuovi l'header del data URL se presente
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Converti il base64 in buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Verifica che il buffer sia valido
    if (imageBuffer.length === 0) {
      return res.status(400).json({
        error: 'Immagine non valida',
        details: 'Il buffer dell\'immagine è vuoto'
      });
    }

    // Crea la directory se non esiste
    const profileDir = path.join('media', 'profilo');
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    // Genera un nome file univoco
    const fileName = `profile_${Date.now()}_${uuidv4()}.webp`;
    const filePath = path.join(profileDir, fileName);

    console.log('Saving to:', filePath);

    // Processa l'immagine con sharp
    await sharp(imageBuffer)
      .rotate()
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 90,
        effort: 6
      })
      .toFile(filePath);

    // Verifica che il file sia stato creato correttamente
    if (!fs.existsSync(filePath)) {
      throw new Error('Il file non è stato creato correttamente');
    }

    // Verifica la dimensione del file
    const stats = await fs.promises.stat(filePath);
    if (stats.size === 0) {
      throw new Error('Il file creato è vuoto');
    }

    // Costruisci il path relativo per il database
    const dbPath = `media/profilo/${fileName}`;

    // Aggiorna il profile_picture_url dell'utente
    await pool.promise().query(
      'UPDATE users SET profile_picture_url = ? WHERE id = ?',
      [dbPath, userId]
    );

    // Recupera l'utente aggiornato
    const [updatedUserResult] = await pool.promise().query<User[]>(
      'SELECT id, name, email, couple_id, theme_preference, profile_picture_url FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Foto profilo aggiornata con successo',
      data: updatedUserResult[0]
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento della foto profilo:', error);
    res.status(500).json({
      error: 'Errore nell\'aggiornamento della foto profilo',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    let updateData: any = {};

    // Gestisci i campi dal body JSON
    if (req.body) {
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.themePreference) updateData.theme_preference = req.body.themePreference;
    }

    // Se non ci sono dati da aggiornare, restituisci un errore
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nessun dato da aggiornare' });
    }

    // Costruisci la query di aggiornamento dinamicamente
    const updateFields = [];
    const updateValues = [];

    if (updateData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updateData.name);
    }
    if (updateData.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(updateData.email);
    }
    if (updateData.theme_preference !== undefined) {
      updateFields.push('theme_preference = ?');
      updateValues.push(updateData.theme_preference);
    }

    // Aggiungi l'ID utente ai valori
    updateValues.push(userId);

    const [result] = await pool.promise().query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
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

// Update user profile by ID (manteniamo anche questa route per retrocompatibilità)
router.put('/:userId', auth, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { name, email, themePreference } = req.body;

    // Verify user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a modificare questo profilo' });
    }

    const [result] = await pool.promise().query(
      `UPDATE users 
       SET name = IFNULL(?, name),
           email = IFNULL(?, email),           
           theme_preference = IFNULL(?, theme_preference)
       WHERE id = ?`,
      [name, email, themePreference, userId]
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

// Get user profile
router.get('/:userId', auth, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    // Verify user is requesting their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a visualizzare questo profilo' });
    }

    const [userResult] = await pool.promise().query<User[]>(
      'SELECT id, name, email, couple_id, theme_preference, profile_picture_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    const user = userResult[0];
    res.json({
      data: {
        ...user,
        profile_picture_url: user.profile_picture_url,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Errore nel recupero del profilo utente' });
  }
});

export default router; 