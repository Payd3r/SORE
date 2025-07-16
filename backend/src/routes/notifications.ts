import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { auth } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Estendi l'interfaccia Request per includere l'utente
interface AuthRequest extends Request {
  user?: {
    id: string | number;
    email: string;
    coupleId?: number;
  };
}

const router = Router();

// Interfaccia per le notifiche
interface Notification extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  body: string;
  icon: string | null;
  url: string | null;
  status: 'read' | 'unread';
  created_at: Date;
}

// Ottenere tutte le notifiche dell'utente
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, offset = 0, status } = req.query;
    
    // Verifica utente autenticato
    if (!userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
    `;
    
    const queryParams: any[] = [userId];
    
    // Filtro per stato (lette/non lette)
    if (status) {
      query += ` AND status = ?`;
      queryParams.push(status);
    }
    
    // Ordinamento e paginazione
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));
    
    // Esegui query con promise
    const [notifications] = await pool.promise().query<Notification[]>(query, queryParams);
    
    // Ottieni conteggio totale e non lette
    const [countResult] = await pool.promise().query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?', 
      [userId]
    );
    
    const [unreadResult] = await pool.promise().query<RowDataPacket[]>(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND status = 0',
      [userId]
    );
    
    res.json({ 
      notifications, 
      total: countResult[0]?.total || 0,
      unread: unreadResult[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Errore nel recupero delle notifiche' });
  }
});

// Segnare una notifica come letta
router.put('/:id/read', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Verifica utente autenticato
    if (!userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const [result] = await pool.promise().query<ResultSetHeader>(
      'UPDATE notifications SET status = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    // Verifica che la notifica esista e appartenga all'utente
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notifica non trovata o non autorizzata' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento della notifica' });
  }
});

// Segnare tutte le notifiche come lette
router.put('/read-all', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Verifica utente autenticato
    if (!userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    await pool.promise().query<ResultSetHeader>(
      'UPDATE notifications SET status = 1 WHERE user_id = ? AND status = 0',
      [userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento delle notifiche' });
  }
});

// Eliminare una notifica
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Verifica utente autenticato
    if (!userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const [result] = await pool.promise().query<ResultSetHeader>(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    // Verifica che la notifica esista e appartenga all'utente
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notifica non trovata o non autorizzata' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione della notifica' });
  }
});

export default router; 