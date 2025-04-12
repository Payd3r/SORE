import express from 'express';
import { auth } from '../middleware/auth';
import * as notificationService from '../services/notificationService';

const router = express.Router();

/**
 * @route   GET /api/notifications/vapid-public-key
 * @desc    Ottiene la chiave pubblica VAPID
 * @access  Public
 */
router.get('/vapid-public-key', async (req, res) => {
  console.log('📢 [API] Richiesta chiave VAPID pubblica');
  try {
    const publicKey = await notificationService.getVapidPublicKey();
    console.log(`📢 [API] Chiave VAPID pubblica recuperata con successo: ${publicKey.substring(0, 10)}...`);
    res.json({ publicKey });
  } catch (error) {
    console.error('❌ [API] Errore nel recupero della chiave VAPID pubblica:', error);
    res.status(500).json({ 
      error: 'Errore nel recupero della chiave VAPID pubblica',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

/**
 * @route   POST /api/notifications/subscribe
 * @desc    Salva una sottoscrizione push
 * @access  Private
 */
router.post('/subscribe', auth, async (req: any, res) => {
  console.log(`📢 [API] Tentativo di sottoscrizione per l'utente ID: ${req.user.id}`);
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    console.log(`📢 [API] Dati sottoscrizione ricevuti:`, JSON.stringify({
      endpoint: subscription?.endpoint?.substring(0, 30) + '...',
      keys: subscription?.keys ? {
        p256dh: subscription.keys.p256dh?.substring(0, 10) + '...',
        auth: subscription.keys.auth?.substring(0, 5) + '...'
      } : 'mancanti'
    }));

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('❌ [API] Dati di sottoscrizione non validi');
      return res.status(400).json({ error: 'Dati di sottoscrizione non validi' });
    }

    await notificationService.saveSubscription(userId, subscription);
    console.log(`✅ [API] Sottoscrizione salvata con successo per l'utente ID: ${userId}`);
    res.status(201).json({ message: 'Sottoscrizione salvata con successo' });
  } catch (error) {
    console.error('❌ [API] Errore durante il salvataggio della sottoscrizione:', error);
    res.status(500).json({ 
      error: 'Errore durante il salvataggio della sottoscrizione',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

/**
 * @route   DELETE /api/notifications/unsubscribe
 * @desc    Elimina una sottoscrizione push
 * @access  Private
 */
router.delete('/unsubscribe', auth, async (req, res) => {
  console.log(`📢 [API] Richiesta di annullamento sottoscrizione`);
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      console.error('❌ [API] Endpoint non fornito per l\'annullamento della sottoscrizione');
      return res.status(400).json({ error: 'Endpoint non fornito' });
    }

    console.log(`📢 [API] Annullamento sottoscrizione per endpoint: ${endpoint.substring(0, 30)}...`);
    await notificationService.deleteSubscription(endpoint);
    console.log('✅ [API] Sottoscrizione eliminata con successo');
    res.json({ message: 'Sottoscrizione eliminata con successo' });
  } catch (error) {
    console.error('❌ [API] Errore durante l\'eliminazione della sottoscrizione:', error);
    res.status(500).json({ 
      error: 'Errore durante l\'eliminazione della sottoscrizione',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Invia una notifica di test
 * @access  Private
 */
router.post('/test', auth, async (req: any, res) => {
  console.log(`📢 [API] Richiesta di invio notifica di test per l'utente ID: ${req.user.id}`);
  try {
    const userId = req.user.id;
    await notificationService.sendTestNotification(userId);
    console.log(`✅ [API] Notifica di test inviata con successo all'utente ID: ${userId}`);
    res.json({ message: 'Notifica di test inviata con successo' });
  } catch (error) {
    console.error('❌ [API] Errore durante l\'invio della notifica di test:', error);
    res.status(500).json({ 
      error: 'Errore durante l\'invio della notifica di test',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

export default router; 