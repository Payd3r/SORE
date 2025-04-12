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
  try {
    const publicKey = await notificationService.getVapidPublicKey();
    res.json({ publicKey });
  } catch (error) {
    console.error('Errore nel recupero della chiave VAPID pubblica:', error);
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
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Dati di sottoscrizione non validi' });
    }

    await notificationService.saveSubscription(userId, subscription);
    res.status(201).json({ message: 'Sottoscrizione salvata con successo' });
  } catch (error) {
    console.error('Errore durante il salvataggio della sottoscrizione:', error);
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
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint non fornito' });
    }

    await notificationService.deleteSubscription(endpoint);
    res.json({ message: 'Sottoscrizione eliminata con successo' });
  } catch (error) {
    console.error('Errore durante l\'eliminazione della sottoscrizione:', error);
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
  try {
    const userId = req.user.id;
    await notificationService.sendTestNotification(userId);
    res.json({ message: 'Notifica di test inviata con successo' });
  } catch (error) {
    console.error('Errore durante l\'invio della notifica di test:', error);
    res.status(500).json({ 
      error: 'Errore durante l\'invio della notifica di test',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
});

export default router; 