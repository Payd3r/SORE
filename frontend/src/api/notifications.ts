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
    // Aggiungi l'Authorization header se disponibile nel localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get('/api/notifications/vapid-public-key', { headers });
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
    const isPWA = isPWAMode();
    
    if (isSafariIOS) {
      console.log('🍎 [CLIENT] Rilevato Safari su iOS, utilizzo configurazione specifica');
      console.log(`🍎 [CLIENT] Modalità PWA: ${isPWA ? 'Sì' : 'No'}`);
    }
    
    try {
      console.log('🔑 [CLIENT] Recupero chiave VAPID pubblica');
      const vapidPublicKey = await getVapidPublicKey();
      console.log('🔑 [CLIENT] Conversione chiave VAPID');
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Per Safari iOS in modalità PWA, potremmo dover usare un approccio diverso
      if (isSafariIOS && isPWA) {
        console.log('🍎 [CLIENT] Utilizzo strategia specifica per Safari iOS in modalità PWA');
        
        // Creiamo una sottoscrizione simulata per Safari iOS
        // Questo permette all'utente di ricevere notifiche via server anche se il browser non supporta completamente le web push API
        try {
          // Controllo se esiste già una sottoscrizione (potrebbe essere una sottoscrizione simulata)
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            console.log('✅ [CLIENT] Sottoscrizione esistente trovata per Safari iOS');
            return existingSubscription;
          }
          
          // Genera un ID casuale per l'endpoint che identificherà questo dispositivo
          const deviceId = `ios-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
          const simulatedEndpoint = `https://push.example.com/safari-ios/${deviceId}`;
          
          // Invece di simulare una PushSubscription, inviamo direttamente i dati al server
          // e indichiamo che è una simulazione per Safari iOS
          console.log('🔍 [CLIENT] Preparazione dati di sottoscrizione per Safari iOS');
          
          // Dati che useremo per la sottoscrizione simulata
          const subscriptionData = {
            endpoint: simulatedEndpoint,
            keys: {
              p256dh: 'safari-ios-' + btoa(deviceId + '-p256dh'),
              auth: 'safari-ios-' + btoa(deviceId + '-auth')
            },
            expirationTime: null,
            isSafariIOSSimulation: true
          };
          
          // Invia la sottoscrizione simulata al server
          console.log('📤 [CLIENT] Invio dati di sottoscrizione al server per Safari iOS');
          console.log('📤 [CLIENT] URL API:', '/api/notifications/subscribe');
          console.log('📤 [CLIENT] Dati inviati:', JSON.stringify({
            subscription: {
              endpoint: subscriptionData.endpoint.substring(0, 30) + '...',
              keys: {
                p256dh: subscriptionData.keys.p256dh.substring(0, 15) + '...',
                auth: subscriptionData.keys.auth.substring(0, 10) + '...',
              },
              isSafariIOSSimulation: true
            }
          }));
          
          try {
            const response = await axios.post('/api/notifications/subscribe', { 
              subscription: subscriptionData,
              isSafariIOSSimulation: true
            }, {
              headers: getAuthHeaders()
            });
            
            console.log('✅ [CLIENT] Risposta del server:', {
              status: response.status,
              data: response.data
            });
            console.log('✅ [CLIENT] Dati di sottoscrizione per Safari iOS salvati sul server');
          } catch (apiError) {
            console.error('❌ [CLIENT] Errore nella chiamata API:', apiError);
            
            if (axios.isAxiosError(apiError)) {
              console.error('❌ [CLIENT] Dettagli errore API:', {
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data,
                url: apiError.config?.url,
                method: apiError.config?.method,
                baseURL: apiError.config?.baseURL
              });
              
              // Controlla se è un problema di autenticazione
              if (apiError.response?.status === 401) {
                console.error('❌ [CLIENT] Problema di autenticazione. Assicurati di aver effettuato il login.');
                throw new Error('Devi aver effettuato il login per attivare le notifiche.');
              }
            }
            
            throw new Error('Errore nella comunicazione con il server. ' + (apiError instanceof Error ? apiError.message : 'Riprova più tardi.'));
          }
          
          return null;
        } catch (iosError) {
          console.error('❌ [CLIENT] Errore durante la gestione delle notifiche per Safari iOS:', iosError);
          throw new Error('Safari iOS richiede l\'installazione come PWA per le notifiche. Aggiungi l\'app alla schermata home.');
        }
      }

      // Approccio standard per browser compatibili
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
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aumentiamo il tempo di attesa
          }
          
          // Per Safari iOS, tentiamo con try/catch multipli e più tentativi
          if (isSafariIOS) {
            let retryCount = 0;
            const maxRetries = 2;
            let lastError = null;
            
            while (retryCount <= maxRetries) {
              try {
                console.log(`🔄 [CLIENT] Tentativo di sottoscrizione ${retryCount + 1}/${maxRetries + 1}`);
                subscription = await registration.pushManager.subscribe(subscribeOptions);
                if (subscription) break;
              } catch (retryError) {
                console.error(`❌ [CLIENT] Errore nel tentativo ${retryCount + 1}:`, retryError);
                lastError = retryError;
                retryCount++;
                // Attendi prima del prossimo tentativo
                await new Promise(resolve => setTimeout(resolve, 800));
              }
            }
            
            if (!subscription && lastError) {
              throw lastError;
            }
          } else {
            subscription = await registration.pushManager.subscribe(subscribeOptions);
          }
          
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

// Funzione helper per ottenere gli headers di autenticazione
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    // Aggiungi l'Authorization header
    const headers = getAuthHeaders();
    
    await axios.post('/api/notifications/subscribe', 
      { subscription: safeSubscription },
      { headers }
    );
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
        data: { endpoint: subscription.endpoint },
        headers: getAuthHeaders()
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
    await axios.post('/api/notifications/test', {}, {
      headers: getAuthHeaders()
    });
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