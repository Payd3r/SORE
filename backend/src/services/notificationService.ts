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
  console.log('🔍 [SERVICE] Recupero chiave VAPID pubblica dal database');
  try {
    const [keys] = await pool.promise().query<VapidKey[]>('SELECT public_key FROM vapid_keys LIMIT 1');
    
    if (keys.length === 0) {
      console.error('❌ [SERVICE] Chiavi VAPID non trovate nel database');
      throw new Error('Chiavi VAPID non trovate. Esegui initializeWebPush() prima.');
    }
    
    console.log(`🔑 [SERVICE] Chiave VAPID pubblica recuperata: ${keys[0].public_key.substring(0, 10)}...`);
    return keys[0].public_key;
  } catch (error) {
    console.error('❌ [SERVICE] Errore durante il recupero della chiave pubblica VAPID:', error);
    throw error;
  }
}

/**
 * Salva una sottoscrizione push nel database
 */
export async function saveSubscription(userId: number, subscription: any): Promise<void> {
  console.log(`🔍 [SERVICE] Salvataggio sottoscrizione per utente ID: ${userId}`);
  console.log(`🔍 [SERVICE] Endpoint: ${subscription.endpoint.substring(0, 30)}...`);

  // Verifica se questa è una sottoscrizione simulata per Safari iOS
  const isSafariIOSSimulation = !!subscription.isSafariIOSSimulation;
  if (isSafariIOSSimulation) {
    console.log(`🍎 [SERVICE] Gestione speciale per sottoscrizione simulata Safari iOS`);
  }

  try {
    // Cerca se esiste già una sottoscrizione con lo stesso endpoint
    console.log(`🔍 [SERVICE] Verifica esistenza sottoscrizione con endpoint: ${subscription.endpoint.substring(0, 30)}...`);
    const [existingSubscriptions] = await pool.promise().query<PushSubscription[]>(
      'SELECT id FROM push_subscriptions WHERE endpoint = ?',
      [subscription.endpoint]
    );
    
    // Salva anche l'informazione che è una sottoscrizione simulata per iOS
    const deviceType = isSafariIOSSimulation ? 'safari-ios' : 'standard';
    
    if (existingSubscriptions.length > 0) {
      console.log(`🔄 [SERVICE] Aggiornamento sottoscrizione esistente ID: ${existingSubscriptions[0].id}`);
      // Aggiorna la sottoscrizione esistente
      await pool.promise().query(
        'UPDATE push_subscriptions SET user_id = ?, p256dh = ?, auth = ?, device_type = ?, updated_at = NOW() WHERE endpoint = ?',
        [userId, subscription.keys.p256dh, subscription.keys.auth, deviceType, subscription.endpoint]
      );
      console.log('✅ [SERVICE] Sottoscrizione aggiornata con successo');
    } else {
      console.log('➕ [SERVICE] Creazione nuova sottoscrizione');
      // Inserisce una nuova sottoscrizione
      await pool.promise().query(
        'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, device_type) VALUES (?, ?, ?, ?, ?)',
        [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, deviceType]
      );
      console.log('✅ [SERVICE] Nuova sottoscrizione creata con successo');
    }
  } catch (error: any) {
    console.error('❌ [SERVICE] Errore durante il salvataggio della sottoscrizione push:', error);
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
  console.log(`🔔 [SERVICE] Invio notifica all'utente ID: ${userId}`);
  console.log(`🔔 [SERVICE] Dettagli notifica:`, { title, body: body.substring(0, 20) + '...', icon, url });
  
  try {
    // Recupera tutte le sottoscrizioni dell'utente
    console.log(`🔍 [SERVICE] Recupero sottoscrizioni per l'utente ID: ${userId}`);
    const [subscriptions] = await pool.promise().query<PushSubscription[]>(
      'SELECT * FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );
    
    if (subscriptions.length === 0) {
      console.log(`⚠️ [SERVICE] Nessuna sottoscrizione trovata per l'utente ${userId}`);
      return;
    }
    
    console.log(`📊 [SERVICE] Trovate ${subscriptions.length} sottoscrizioni per l'utente ${userId}`);
    
    // Salva la notifica nel database
    console.log(`💾 [SERVICE] Salvataggio notifica nel database`);
    const [notificationResult] = await pool.promise().query<any>(
      'INSERT INTO notifications (user_id, title, body, icon, url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, body, icon, url, 'pending']
    );
    
    const notificationId = notificationResult.insertId;
    console.log(`💾 [SERVICE] Notifica salvata con ID: ${notificationId}`);
    
    // Prepara il payload della notifica
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-152x152.png',
      url: url || '/',
      timestamp: new Date().getTime()
    });
    
    console.log(`📤 [SERVICE] Invio notifica a ${subscriptions.length} dispositivi`);
    
    // Invia la notifica a tutti i dispositivi
    const sendPromises = subscriptions.map(async (subscription, index) => {
      try {
        console.log(`📱 [SERVICE] Tentativo invio al dispositivo ${index + 1}/${subscriptions.length} (ID: ${subscription.id})`);
        
        // Verifica se è una sottoscrizione simulata per Safari iOS
        if (subscription.device_type === 'safari-ios') {
          console.log(`🍎 [SERVICE] Rilevata sottoscrizione Safari iOS simulata: ID ${subscription.id}`);
          
          // Per le sottoscrizioni simulate di Safari iOS, potresti voler usare un altro sistema di notifica
          // come email, SMS, o un servizio di notifiche alternative per iOS
          // Questo sarebbe implementato separatamente
          
          console.log(`🍎 [SERVICE] Notifica registrata per il dispositivo Safari iOS: ID ${subscription.id}`);
          
          // Segna come inviata ma non inviamo realmente tramite web push
          await pool.promise().query(
            'UPDATE push_subscriptions SET last_notification_sent = NOW() WHERE id = ?',
            [subscription.id]
          );
          
          return true; // Consideriamo l'invio come riuscito anche se non è una vera push notification
        }
        
        // Per le sottoscrizioni standard, procedi normalmente
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };
        
        console.log(`📤 [SERVICE] Endpoint: ${subscription.endpoint.substring(0, 30)}...`);
        await webpush.sendNotification(pushSubscription, payload);
        
        // Aggiorna il timestamp dell'ultima notifica inviata
        await pool.promise().query(
          'UPDATE push_subscriptions SET last_notification_sent = NOW() WHERE id = ?',
          [subscription.id]
        );
        
        console.log(`✅ [SERVICE] Notifica inviata con successo al dispositivo ID: ${subscription.id}`);
        return true;
      } catch (error: any) {
        console.error(`❌ [SERVICE] Errore invio notifica alla sottoscrizione ${subscription.id}:`, error);
        console.error(`❌ [SERVICE] Codice errore: ${error.statusCode}, messaggio: ${error.message}`);
        
        // Se riceviamo un errore 410 (Gone), la sottoscrizione non è più valida
        if (error.statusCode === 410) {
          console.log(`🗑️ [SERVICE] Sottoscrizione ${subscription.id} non più valida (410 Gone), eliminazione...`);
          await pool.promise().query('DELETE FROM push_subscriptions WHERE id = ?', [subscription.id]);
        }
        
        return false;
      }
    });
    
    const results = await Promise.all(sendPromises);
    const successCount = results.filter(Boolean).length;
    
    // Aggiorna lo stato della notifica
    console.log(`📊 [SERVICE] Risultato: ${successCount}/${subscriptions.length} notifiche inviate con successo`);
    await pool.promise().query(
      'UPDATE notifications SET status = ?, sent_at = NOW() WHERE id = ?',
      [successCount > 0 ? 'sent' : 'failed', notificationId]
    );
    
    console.log(`✅ [SERVICE] Notifica ID ${notificationId} completata: ${successCount}/${subscriptions.length} dispositivi raggiunti`);
  } catch (error: any) {
    console.error('❌ [SERVICE] Errore critico durante l\'invio della notifica:', error);
    throw error;
  }
}

/**
 * Invia una notifica di test a un utente specifico
 */
export async function sendTestNotification(userId: number): Promise<void> {
  console.log(`🔔 [SERVICE] Invio notifica di test all'utente ID: ${userId}`);
  try {
    await sendNotificationToUser(
      userId,
      'Notifica di Test',
      'Questa è una notifica di test da Memory Grove! 🎉',
      '/icons/icon-152x152.png',
      '/'
    );
    console.log(`✅ [SERVICE] Notifica di test inviata con successo all'utente ID: ${userId}`);
  } catch (error) {
    console.error(`❌ [SERVICE] Errore invio notifica di test all'utente ID: ${userId}:`, error);
    throw error;
  }
}

/**
 * Elimina una sottoscrizione push dal database
 */
export async function deleteSubscription(endpoint: string): Promise<void> {
  console.log(`🗑️ [SERVICE] Eliminazione sottoscrizione con endpoint: ${endpoint.substring(0, 30)}...`);
  try {
    await pool.promise().query('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
    console.log(`✅ [SERVICE] Sottoscrizione con endpoint ${endpoint.substring(0, 30)}... eliminata`);
  } catch (error) {
    console.error('❌ [SERVICE] Errore durante l\'eliminazione della sottoscrizione push:', error);
    throw error;
  }
} 