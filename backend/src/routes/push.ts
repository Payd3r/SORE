import { Router, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool from '../config/db';
import { auth } from '../middleware/auth';
import { sendPushToUser } from '../services/pushService';

interface AuthRequest extends Request {
  user?: {
    id: string | number;
    email: string;
    coupleId?: number;
  };
}

interface PushSubscriptionBody {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
  deviceInfo?: Record<string, unknown> | null;
}

const router = Router();

router.get('/vapid-public-key', (_req: Request, res: Response) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(503).json({ error: 'Chiave VAPID pubblica non configurata' });
  }

  return res.json({ publicKey });
});

router.post('/subscribe', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const body = req.body as PushSubscriptionBody;
    const endpoint = body?.endpoint;
    const p256dh = body?.keys?.p256dh;
    const authKey = body?.keys?.auth;
    const expirationTime = body?.expirationTime ?? null;
    const deviceInfo = body?.deviceInfo ? JSON.stringify(body.deviceInfo) : null;

    if (!userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }

    if (!endpoint || !p256dh || !authKey) {
      return res.status(400).json({ error: 'Payload subscription non valido' });
    }

    await pool.promise().query<ResultSetHeader>(
      `INSERT INTO push_subscriptions
        (user_id, endpoint, p256dh, auth, expiration_time, device_info, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        p256dh = VALUES(p256dh),
        auth = VALUES(auth),
        expiration_time = VALUES(expiration_time),
        device_info = VALUES(device_info),
        updated_at = NOW()`,
      [userId, endpoint, p256dh, authKey, expirationTime, deviceInfo]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error subscribing push notification:', error);
    return res.status(500).json({ error: 'Errore nella registrazione della subscription' });
  }
});

router.delete('/unsubscribe', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }

    const [result] = await pool.promise().query<ResultSetHeader>(
      'DELETE FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );

    return res.json({ success: true, removed: result.affectedRows });
  } catch (error) {
    console.error('Error unsubscribing push notification:', error);
    return res.status(500).json({ error: 'Errore nella rimozione delle subscription' });
  }
});

router.post('/test', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }

    await sendPushToUser(userId, {
      title: 'Push attive',
      body: 'Le notifiche push sono configurate correttamente.',
      url: '/profilo',
      icon: '/icons/icon-152x152.png',
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error sending push test notification:', error);
    return res.status(500).json({ error: 'Errore nell\'invio della push di test' });
  }
});

export default router;
