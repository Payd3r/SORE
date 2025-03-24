import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { auth } from '../middleware/auth';
import { DbRow, User, Couple, ResultSetHeader } from '../types/db';

const router = express.Router();

router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.promise().query<DbRow[]>('SELECT NOW()');

    res.json({
      success: true,
      message: 'Connessione al database riuscita',
      timestamp: rows[0]['NOW()'],
      databaseInfo: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      }
    });
  } catch (error) {
    console.error('Errore di connessione al database:', error);
    res.status(500).json({
      success: false,
      error: 'Errore di connessione al database',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

// Register with existing couple
router.post('/register/join', async (req, res) => {
  try {
    const { name, email, password, coupleId } = req.body;

    // Validate input
    if (!name || !email || !password || !coupleId) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato email non valido' });
    }

    // Check if email already exists
    const [existingUser] = await pool.promise().query<User[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    // Check if couple exists
    const [coupleResult] = await pool.promise().query<Couple[]>(
      'SELECT id FROM couples WHERE id = ?',
      [coupleId]
    );

    if (coupleResult.length === 0) {
      return res.status(404).json({ error: 'Coppia non trovata' });
    }

    // Check if couple already has two members
    const [coupleMembers] = await pool.promise().query<DbRow[]>(
      'SELECT COUNT(*) as count FROM users WHERE couple_id = ?',
      [coupleId]
    );

    if (parseInt(coupleMembers[0].count) >= 2) {
      return res.status(400).json({ error: 'La coppia ha già due membri' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await pool.promise().query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, couple_id) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, coupleId]
    );

    const userId = result.insertId;

    // Fetch the created user
    const [userResult] = await pool.promise().query<User[]>(
      'SELECT id, name, email, couple_id, theme_preference, profile_picture_url FROM users WHERE id = ?',
      [userId]
    );

    // Generate token
    const token = jwt.sign(
      { id: userResult[0].id, email, coupleId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userResult[0].id,
        name: userResult[0].name,
        email: userResult[0].email,
        coupleId: userResult[0].couple_id,
        themePreference: userResult[0].theme_preference || 'light',
        profilePictureUrl: userResult[0].profile_picture_url
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
});

// Register with new couple
router.post('/register/new', async (req, res) => {
  try {
    const { name, email, password, coupleName, anniversaryDate } = req.body;

    // Validate input
    if (!name || !email || !password || !coupleName || !anniversaryDate) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato email non valido' });
    }

    // Check if email already exists
    const [existingUser] = await pool.promise().query<User[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    // Validate anniversary date
    const anniversary = new Date(anniversaryDate);
    if (isNaN(anniversary.getTime())) {
      return res.status(400).json({ error: 'Data anniversario non valida' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Start transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      console.log('Creating couple with name:', coupleName);
      // Create couple
      const [coupleResult] = await connection.query<ResultSetHeader>(
        'INSERT INTO couples (name, anniversary_date) VALUES (?, ?)',
        [coupleName, anniversaryDate]
      );

      if (!coupleResult.insertId) {
        throw new Error('Failed to create couple: insertId is 0');
      }

      const coupleId = coupleResult.insertId;

      // Verify couple was created
      const [coupleCheck] = await connection.query<Couple[]>(
        'SELECT id FROM couples WHERE id = ?',
        [coupleId]
      );

      if (coupleCheck.length === 0) {
        throw new Error('Couple was not created successfully');
      }

      // Create user
      const [userResult] = await connection.query<ResultSetHeader>(
        'INSERT INTO users (name, email, password_hash, couple_id) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, coupleId]
      );

      if (!userResult.insertId) {
        throw new Error('Failed to create user: insertId is 0');
      }

      const userId = userResult.insertId;

      // Fetch the created user
      const [createdUser] = await connection.query<User[]>(
        'SELECT id, name, email, couple_id, theme_preference, profile_picture_url FROM users WHERE id = ?',
        [userId]
      );

      if (createdUser.length === 0) {
        throw new Error('User was not created successfully');
      }

      await connection.commit();

      // Generate token
      const token = jwt.sign(
        { id: createdUser[0].id, email, coupleId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: createdUser[0].id,
          name: createdUser[0].name,
          email: createdUser[0].email,
          coupleId: createdUser[0].couple_id,
          themePreference: createdUser[0].theme_preference || 'light',
          profilePictureUrl: createdUser[0].profile_picture_url
        },
      });
    } catch (error) {
      console.error('Transaction error:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        errno: (error as any).errno,
        sqlState: (error as any).sqlState,
        sqlMessage: (error as any).sqlMessage
      });
    }
    res.status(500).json({ 
      error: 'Errore durante la registrazione',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato email non valido' });
    }

    // Find user
    const [userResult] = await pool.promise().query<User[]>(
      'SELECT id, name, email, password_hash, couple_id, theme_preference, profile_picture_url FROM users WHERE email = ?',
      [email]
    );

    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = userResult[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, coupleId: user.couple_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coupleId: user.couple_id,
        themePreference: user.theme_preference || 'light',
        profilePictureUrl: user.profile_picture_url
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

// Get current user
router.get('/me', auth, async (req: any, res) => {
  try {
    const [userResult] = await pool.promise().query<User[]>(
      'SELECT id, name, email, couple_id, theme_preference, profile_picture_url FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ user: userResult[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Errore nel recupero dei dati utente' });
  }
});

export default router;
