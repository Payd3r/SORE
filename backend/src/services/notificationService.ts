import webpush from 'web-push';
import pool from '../config/db';
import { PushSubscription, VapidKey, Notification, QueryResult } from '../types/db';

/**
 * Inizializza il servizio di notifiche web push
 */
export async function initializeWebPush(): Promise<void> {
  try {
    // Verifica se esistono già delle chiavi VAPID nel database
    const [keys] = await pool.promise().query<VapidKey[]>('SELECT * FROM vapid_keys LIMIT 1');
    
    if (keys.length === 0) {
      // Genera nuove chiavi VAPID
      console.log('Generazione nuove chiavi VAPID...');
      const vapidKeys = webpush.generateVAPIDKeys();
      
      // Salva le chiavi nel database
      await pool.promise().query<QueryResult<any>>(
        'INSERT INTO vapid_keys (public_key, private_key) VALUES (?, ?)',
        [vapidKeys.publicKey, vapidKeys.privateKey]
      );
      
      // Configura web-push con le nuove chiavi
      webpush.setVapidDetails(
        'mailto:' + (process.env.VAPID_CONTACT_EMAIL || 'example@example.com'),
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );
      
      console.log('Chiavi VAPID generate e salvate nel database');
    } else {
      // Utilizza le chiavi esistenti
      console.log('Utilizzo chiavi VAPID esistenti');
      webpush.setVapidDetails(
        'mailto:' + (process.env.VAPID_CONTACT_EMAIL || 'example@example.com'),
        keys[0].public_key,
        keys[0].private_key
      );
    }
  } catch (error: any) {
    console.error('Errore durante l\'inizializzazione di web-push:', error);
    throw error;
  }
}

/**
 * Ottiene la chiave pubblica VAPID
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const [keys] = await pool.promise().query<VapidKey[]>('SELECT public_key FROM vapid_keys LIMIT 1');
    
    if (keys.length === 0) {
      throw new Error('Chiavi VAPID non trovate. Esegui initializeWebPush() prima.');
    }
    
    return keys[0].public_key;
  } catch (error) {
    console.error('Errore durante il recupero della chiave pubblica VAPID:', error);
    throw error;
  }
}

/**
 * Salva una sottoscrizione push nel database
 */
export async function saveSubscription(userId: number, subscription: any): Promise<void> {
  try {
    // Cerca se esiste già una sottoscrizione con lo stesso endpoint
    const [existingSubscriptions] = await pool.promise().query<PushSubscription[]>(
      'SELECT id FROM push_subscriptions WHERE endpoint = ?',
      [subscription.endpoint]
    );
    
    if (existingSubscriptions.length > 0) {
      // Aggiorna la sottoscrizione esistente
      await pool.promise().query(
        'UPDATE push_subscriptions SET user_id = ?, p256dh = ?, auth = ?, updated_at = NOW() WHERE endpoint = ?',
        [userId, subscription.keys.p256dh, subscription.keys.auth, subscription.endpoint]
      );
    } else {
      // Inserisce una nuova sottoscrizione
      await pool.promise().query(
        'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
        [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
      );
    }
  } catch (error: any) {
    console.error('Errore durante il salvataggio della sottoscrizione push:', error);
    throw error;
  }
}

/**
 * Invia una notifica a tutti i dispositivi di un utente
 */
export async function sendNotificationToUser(
  userId: number, 
  title: string, 
  body: string, 
  icon: string | null = null, 
  url: string | null = null
): Promise<void> {
  try {
    // Recupera tutte le sottoscrizioni dell'utente
    const [subscriptions] = await pool.promise().query<PushSubscription[]>(
      'SELECT * FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );
    
    if (subscriptions.length === 0) {
      console.log(`Nessuna sottoscrizione trovata per l'utente ${userId}`);
      return;
    }
    
    // Salva la notifica nel database
    const [notificationResult] = await pool.promise().query<any>(
      'INSERT INTO notifications (user_id, title, body, icon, url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, body, icon, url, 'pending']
    );
    
    const notificationId = notificationResult.insertId;
    
    // Prepara il payload della notifica
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-152x152.png',
      url: url || '/',
      timestamp: new Date().getTime()
    });
    
    // Invia la notifica a tutti i dispositivi
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };
        
        await webpush.sendNotification(pushSubscription, payload);
        
        // Aggiorna il timestamp dell'ultima notifica inviata
        await pool.promise().query(
          'UPDATE push_subscriptions SET last_notification_sent = NOW() WHERE id = ?',
          [subscription.id]
        );
        
        return true;
      } catch (error: any) {
        console.error(`Errore durante l'invio della notifica alla sottoscrizione ${subscription.id}:`, error);
        
        // Se riceviamo un errore 410 (Gone), la sottoscrizione non è più valida
        if (error.statusCode === 410) {
          console.log(`Sottoscrizione ${subscription.id} non più valida, eliminazione...`);
          await pool.promise().query('DELETE FROM push_subscriptions WHERE id = ?', [subscription.id]);
        }
        
        return false;
      }
    });
    
    const results = await Promise.all(sendPromises);
    const successCount = results.filter(Boolean).length;
    
    // Aggiorna lo stato della notifica
    await pool.promise().query(
      'UPDATE notifications SET status = ?, sent_at = NOW() WHERE id = ?',
      [successCount > 0 ? 'sent' : 'failed', notificationId]
    );
    
    console.log(`Notifica inviata con successo a ${successCount}/${subscriptions.length} dispositivi`);
  } catch (error: any) {
    console.error('Errore durante l\'invio della notifica:', error);
    throw error;
  }
}

/**
 * Invia una notifica di test a un utente specifico
 */
export async function sendTestNotification(userId: number): Promise<void> {
  return sendNotificationToUser(
    userId,
    'Notifica di Test',
    'Questa è una notifica di test da Memory Grove! 🎉',
    '/icons/icon-152x152.png',
    '/'
  );
}

/**
 * Elimina una sottoscrizione push dal database
 */
export async function deleteSubscription(endpoint: string): Promise<void> {
  try {
    await pool.promise().query('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
    console.log(`Sottoscrizione con endpoint ${endpoint} eliminata`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione della sottoscrizione push:', error);
    throw error;
  }
} 