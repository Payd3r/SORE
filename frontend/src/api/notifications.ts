import axios from 'axios';

/**
 * Controlla se le notifiche sono supportate dal browser
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

/**
 * Richiede il permesso per le notifiche
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.error('Le notifiche push non sono supportate da questo browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Errore durante la richiesta del permesso:', error);
    return false;
  }
}

/**
 * Ottiene la chiave pubblica VAPID dal server
 */
async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await axios.get('/api/notifications/vapid-public-key');
    return response.data.publicKey;
  } catch (error) {
    console.error('Errore nel recupero della chiave VAPID pubblica:', error);
    throw error;
  }
}

/**
 * Registra il service worker se non è già registrato
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker non supportato');
  }

  try {
    // Assumiamo che il service worker sia già registrato in index.html
    const registration = await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Errore durante la registrazione del service worker:', error);
    throw error;
  }
}

/**
 * Sottoscrive l'utente alle notifiche push
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  const permissionGranted = await requestNotificationPermission();
  
  if (!permissionGranted) {
    console.warn('Permesso notifiche non concesso');
    return null;
  }

  try {
    const registration = await registerServiceWorker();
    const vapidPublicKey = await getVapidPublicKey();
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Controlla se esiste già una sottoscrizione
    let subscription = await registration.pushManager.getSubscription();
    
    // Se non esiste, crea una nuova sottoscrizione
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      // Invia la sottoscrizione al server
      await saveSubscription(subscription);
    }
    
    return subscription;
  } catch (error) {
    console.error('Errore durante la sottoscrizione alle notifiche push:', error);
    throw error;
  }
}

/**
 * Salva la sottoscrizione sul server
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  try {
    await axios.post('/api/notifications/subscribe', { subscription });
  } catch (error) {
    console.error('Errore durante il salvataggio della sottoscrizione:', error);
    throw error;
  }
}

/**
 * Annulla la sottoscrizione alle notifiche push
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Elimina la sottoscrizione dal server
      await axios.delete('/api/notifications/unsubscribe', {
        data: { endpoint: subscription.endpoint }
      });
      
      // Annulla la sottoscrizione lato client
      await subscription.unsubscribe();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Errore durante l\'annullamento della sottoscrizione:', error);
    throw error;
  }
}

/**
 * Invia una notifica di test
 */
export async function sendTestNotification(): Promise<void> {
  try {
    await axios.post('/api/notifications/test');
  } catch (error) {
    console.error('Errore durante l\'invio della notifica di test:', error);
    throw error;
  }
}

/**
 * Converte una stringa base64 in Uint8Array (necessario per applicationServerKey)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Verifica se il dispositivo è iOS
 */
export const isIOSDevice = (): boolean => {
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
};

/**
 * Verifica se l'app è in modalità PWA (Progressive Web App)
 */
export const isPWAMode = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.matchMedia('(display-mode: fullscreen)').matches || 
         (window.navigator as any).standalone === true;
};

/**
 * Controlla lo stato del permesso delle notifiche
 * @returns Lo stato del permesso come stringa
 */
export const checkPermission = async (): Promise<NotificationPermission | null> => {
  if (!isPushNotificationSupported()) {
    return null;
  }
  
  return Notification.permission;
}; 