import axios from 'axios';

/**
 * Controlla se le notifiche sono supportate dal browser
 */
export function isPushNotificationSupported(): boolean {
  const isSupported = 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
  
  console.log('📱 [CLIENT] Controllo supporto notifiche push:', {
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notification: 'Notification' in window,
    isSupported
  });
  
  return isSupported;
}

/**
 * Richiede il permesso per le notifiche
 */
export async function requestNotificationPermission(): Promise<boolean> {
  console.log('🔔 [CLIENT] Richiesta permesso notifiche');
  
  if (!isPushNotificationSupported()) {
    console.error('❌ [CLIENT] Le notifiche push non sono supportate da questo browser');
    return false;
  }

  try {
    console.log('🔔 [CLIENT] Permesso attuale:', Notification.permission);
    const permission = await Notification.requestPermission();
    console.log('🔔 [CLIENT] Permesso ottenuto:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('❌ [CLIENT] Errore durante la richiesta del permesso:', error);
    return false;
  }
}

/**
 * Ottiene la chiave pubblica VAPID dal server
 */
async function getVapidPublicKey(): Promise<string> {
  console.log('🔑 [CLIENT] Richiesta chiave VAPID pubblica al server');
  try {
    const response = await axios.get('/api/notifications/vapid-public-key');
    console.log('🔑 [CLIENT] Chiave VAPID pubblica ricevuta:', response.data.publicKey.substring(0, 10) + '...');
    return response.data.publicKey;
  } catch (error) {
    console.error('❌ [CLIENT] Errore nel recupero della chiave VAPID pubblica:', error);
    throw error;
  }
}

/**
 * Registra il service worker se non è già registrato
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  console.log('🔧 [CLIENT] Verifica registrazione Service Worker');
  
  if (!('serviceWorker' in navigator)) {
    console.error('❌ [CLIENT] Service Worker non supportato');
    throw new Error('Service Worker non supportato');
  }

  try {
    // Assumiamo che il service worker sia già registrato in index.html
    console.log('🔧 [CLIENT] Attesa service worker ready');
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ [CLIENT] Service Worker pronto:', registration);
    
    // Log dei dettagli del service worker
    if (registration.active) {
      console.log('✅ [CLIENT] Service Worker attivo, script:', registration.active.scriptURL);
    } else if (registration.installing) {
      console.log('🔄 [CLIENT] Service Worker in fase di installazione');
    } else if (registration.waiting) {
      console.log('⏳ [CLIENT] Service Worker in attesa');
    } else {
      console.log('❓ [CLIENT] Service Worker in stato sconosciuto');
    }
    
    if (navigator.serviceWorker.controller) {
      console.log('✅ [CLIENT] Service Worker controlla questa pagina');
    } else {
      console.log('⚠️ [CLIENT] Service Worker NON controlla questa pagina');
    }
    
    return registration;
  } catch (error) {
    console.error('❌ [CLIENT] Errore durante la registrazione del service worker:', error);
    throw error;
  }
}

/**
 * Sottoscrive l'utente alle notifiche push
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  console.log('🔔 [CLIENT] Inizio processo di sottoscrizione alle notifiche push');
  
  const permissionGranted = await requestNotificationPermission();
  
  if (!permissionGranted) {
    console.warn('⚠️ [CLIENT] Permesso notifiche non concesso');
    return null;
  }

  try {
    console.log('🔧 [CLIENT] Recupero registrazione Service Worker');
    const registration = await registerServiceWorker();
    
    // Safari su iOS richiede un approccio più specifico
    const isSafariIOS = isIOSDevice() && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isSafariIOS) {
      console.log('🍎 [CLIENT] Rilevato Safari su iOS, utilizzo configurazione specifica');
    }
    
    try {
      console.log('🔑 [CLIENT] Recupero chiave VAPID pubblica');
      const vapidPublicKey = await getVapidPublicKey();
      console.log('🔑 [CLIENT] Conversione chiave VAPID');
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Controlla se esiste già una sottoscrizione
      console.log('🔍 [CLIENT] Verifica esistenza sottoscrizione');
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('✅ [CLIENT] Sottoscrizione esistente trovata:', subscription.endpoint.substring(0, 30) + '...');
      } else {
        console.log('🔄 [CLIENT] Nessuna sottoscrizione esistente, creazione nuova sottoscrizione...');
      }
      
      // Se non esiste, crea una nuova sottoscrizione
      if (!subscription) {
        try {
          // Opzioni di sottoscrizione che funzionano con Safari
          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          };
          
          console.log('🔔 [CLIENT] Creazione nuova sottoscrizione con options:', {
            userVisibleOnly: true,
            applicationServerKey: 'convertedVapidKey (omesso per brevità)'
          });
          
          // Ritardo per Safari prima di tentare la sottoscrizione
          if (isSafariIOS) {
            console.log('⏱️ [CLIENT] Attendere breve pausa prima della sottoscrizione su Safari');
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          subscription = await registration.pushManager.subscribe(subscribeOptions);
          
          if (!subscription) {
            console.error('❌ [CLIENT] La sottoscrizione è fallita senza errori specifici');
            return null;
          }
          
          console.log('✅ [CLIENT] Sottoscrizione creata con successo');
          console.log('🔍 [CLIENT] Dettagli sottoscrizione:', {
            endpoint: subscription.endpoint.substring(0, 30) + '...',
            expirationTime: subscription.expirationTime
          });
          
          // Invia la sottoscrizione al server con un formato adatto anche a Safari
          console.log('📤 [CLIENT] Invio sottoscrizione al server');
          await saveSubscription(subscription);
          console.log('✅ [CLIENT] Sottoscrizione salvata sul server');
        } catch (subscribeError) {
          console.error('❌ [CLIENT] Errore durante la creazione della sottoscrizione:', subscribeError);
          // Log ulteriori dettagli dell'errore
          if (subscribeError instanceof Error) {
            console.error('❌ [CLIENT] Dettagli errore:', {
              name: subscribeError.name,
              message: subscribeError.message,
              stack: subscribeError.stack
            });
          }
          
          // Controlla se il dispositivo è iOS (Safari)
          if (isIOSDevice()) {
            console.error('❌ [CLIENT] Difficoltà nell\'utilizzo delle notifiche push su Safari iOS. Prova ad installare l\'app nella schermata home.');
            throw new Error('Le notifiche push su Safari iOS potrebbero richiedere l\'installazione come PWA. Per favore aggiungi l\'app alla schermata home.');
          }
          throw subscribeError;
        }
      }
      
      return subscription;
    } catch (vapidError) {
      console.error('❌ [CLIENT] Errore durante il recupero della chiave VAPID o la sottoscrizione:', vapidError);
      throw vapidError;
    }
  } catch (error) {
    console.error('❌ [CLIENT] Errore durante la sottoscrizione alle notifiche push:', error);
    throw error;
  }
}

/**
 * Salva la sottoscrizione sul server
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  console.log('💾 [CLIENT] Salvataggio sottoscrizione sul server');
  
  // Definiamo un'interfaccia per il formato di sottoscrizione che può avere la proprietà keys
  interface ExtendedPushSubscription {
    endpoint: string;
    expirationTime: number | null;
    keys?: {
      p256dh: string;
      auth: string;
    };
  }
  
  // Casting di subscription a any per accedere alle proprietà in modo sicuro
  const subscriptionData = subscription as any;
  
  // Assicuriamoci che la sottoscrizione sia in un formato valido per Safari
  const safeSubscription: ExtendedPushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscriptionData.keys?.p256dh || '',
      auth: subscriptionData.keys?.auth || ''
    },
    expirationTime: subscription.expirationTime || null
  };
  
  try {
    await axios.post('/api/notifications/subscribe', { subscription: safeSubscription });
    console.log('✅ [CLIENT] Sottoscrizione salvata con successo sul server');
  } catch (error) {
    console.error('❌ [CLIENT] Errore durante il salvataggio della sottoscrizione:', error);
    
    // Log dettagliato dell'errore di risposta del server
    if (axios.isAxiosError(error) && error.response) {
      console.error('❌ [CLIENT] Dettagli errore server:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
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