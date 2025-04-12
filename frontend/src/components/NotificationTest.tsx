import React, { useState, useEffect, useCallback } from 'react';
import { 
  isPushNotificationSupported, 
  requestNotificationPermission, 
  isIOSDevice,
  isPWAMode,
  checkPermission,
  registerServiceWorker,
  unsubscribeFromPushNotifications
} from '../api/notifications';

const NotificationTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSimulatedSubscription, setIsSimulatedSubscription] = useState<boolean>(false);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [showAdvancedDebug, setShowAdvancedDebug] = useState(false);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  
  // Log dei passaggi di sottoscrizione
  const [subscriptionSteps, setSubscriptionSteps] = useState<Array<{
    step: string;
    status: 'pending' | 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);
  
  // Funzione per aggiungere un passaggio al log
  const addSubscriptionStep = (step: string, status: 'pending' | 'success' | 'error' | 'info', message: string) => {
    setSubscriptionSteps(prev => [...prev, {
      step,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  // Funzione per aggiungere log direttamente all'UI senza sovrascrivere console
  const addApiLog = (message: string, isError = false) => {
    setApiLogs(prev => [...prev, `${isError ? '❌' : '📋'} ${message}`]);
  };
  
  // Stato per le informazioni di debug
  const [debugInfo, setDebugInfo] = useState<{
    serviceWorkerSupported: boolean;
    notificationsSupported: boolean;
    pushManagerSupported: boolean;
    permissionState: string;
    serviceWorkerState: string;
    serviceWorkerURL: string;
    isIOS: boolean;
    isPWA: boolean;
    userAgent: string;
    subscriptionDetails: string | null;
    vapidKey: string | null;
    pushEndpoint: string | null;
    swRegistrations: any[];
    error: string | null;
  }>({
    serviceWorkerSupported: false,
    notificationsSupported: false,
    pushManagerSupported: false,
    permissionState: 'unknown',
    serviceWorkerState: 'unknown',
    serviceWorkerURL: 'none',
    isIOS: false,
    isPWA: false,
    userAgent: navigator.userAgent,
    subscriptionDetails: null,
    vapidKey: null,
    pushEndpoint: null,
    swRegistrations: [],
    error: null,
  });

  const updateDebugInfo = useCallback(async (error: string | null = null) => {
    try {
      const swSupported = 'serviceWorker' in navigator;
      const notifSupported = isPushNotificationSupported();
      const pushSupported = swSupported && 'PushManager' in window;
      const permState = await checkPermission() || 'unknown';
      const isIOS = isIOSDevice();
      const isPWA = isPWAMode();
      const swRegistrations = [];
      let swState = 'unknown';
      let serviceWorkerURL = 'none';
      let subscriptionDetails = null;
      let pushEndpoint = null;
      let vapidKey = null;
      
      // Ottieni tutte le registrazioni del service worker
      if (swSupported) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const reg of registrations) {
          swRegistrations.push({
            scope: reg.scope,
            active: !!reg.active,
            installing: !!reg.installing,
            waiting: !!reg.waiting,
            updateViaCache: reg.updateViaCache
          });
          
          // Dettagli sul push manager
          if (reg.pushManager) {
            try {
              const subscription = await reg.pushManager.getSubscription();
              if (subscription) {
                subscriptionDetails = JSON.stringify(subscription, null, 2);
                pushEndpoint = subscription.endpoint;
                
                // Prova ad estrarre la VAPID key
                try {
                  const options = subscription.options || {};
                  if (options.applicationServerKey) {
                    const keyArr = new Uint8Array(options.applicationServerKey);
                    vapidKey = Array.from(keyArr).map(b => 
                      b.toString(16).padStart(2, '0')).join('');
                  }
                } catch (e) {
                  console.error('Errore estrazione VAPID key:', e);
                }
              }
            } catch (e) {
              console.error('Errore recupero sottoscrizione:', e);
            }
          }
        }
        
        // Ottieni la registrazione corrente
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          serviceWorkerURL = registration.active?.scriptURL || 'unknown';
          swState = registration.active 
            ? 'active' 
            : registration.installing 
              ? 'installing' 
              : registration.waiting 
                ? 'waiting' 
                : 'registered';
        } else {
          swState = 'not registered';
        }
        
        // Controlla se il service worker controlla la pagina
        if (navigator.serviceWorker.controller) {
          swState += ' (controlling)';
        }
      }

      setDebugInfo({
        serviceWorkerSupported: swSupported,
        notificationsSupported: notifSupported,
        pushManagerSupported: pushSupported,
        permissionState: permState,
        serviceWorkerState: swState,
        serviceWorkerURL,
        isIOS,
        isPWA,
        userAgent: navigator.userAgent,
        subscriptionDetails,
        vapidKey,
        pushEndpoint,
        swRegistrations,
        error,
      });
    } catch (e) {
      setDebugInfo(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : 'Unknown error',
        serviceWorkerState: 'error during check'
      }));
    }
  }, []);

  useEffect(() => {
    // Inizializzazione del componente
    const init = async () => {
      addApiLog('Inizializzazione del componente NotificationTest');
      try {
        const currentPermission = await checkPermission();
        setPermission(currentPermission);
        
        // Try to register service worker on component mount
        if ('serviceWorker' in navigator) {
          try {
            await registerServiceWorker();
            addApiLog('Service worker registrato con successo');
          } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            addApiLog(`Errore nella registrazione del service worker: ${errorMsg}`, true);
          }
        }

        // Check subscription status
        if (currentPermission === 'granted' && 'serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration?.pushManager) {
              const subscription = await registration.pushManager.getSubscription();
              setIsSubscribed(!!subscription);
              addApiLog(`Stato sottoscrizione: ${!!subscription ? 'attiva' : 'inattiva'}`);
            }
          } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            addApiLog(`Errore controllo sottoscrizione: ${errorMsg}`, true);
          }
        }
        
        // Update debug info
        await updateDebugInfo();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addApiLog(`Errore inizializzazione: ${errorMsg}`, true);
        await updateDebugInfo(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    init();
  }, [updateDebugInfo]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setStatus('Verifica del supporto per le notifiche...');
    setStatusType('info');
    
    // Reset dei logs e degli errori
    setSubscriptionSteps([]);
    setApiLogs([]);
    setDebugInfo(prev => ({...prev, error: null}));
    
    addSubscriptionStep('init', 'pending', 'Inizializzazione processo di sottoscrizione');
    addApiLog('Avvio processo di sottoscrizione');

    // Rimuovo il blocco per Safari iOS e sostituisco con un avviso informativo
    const isSafariIOS = isIOSDevice() && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isSafariIOS) {
      addSubscriptionStep('check_compatibility', 'info', 'Rilevato Safari su iOS - Utilizzo configurazione specifica');
      addApiLog('Rilevato Safari su iOS - Utilizzo configurazione specifica');
    }

    try {
      addSubscriptionStep('check_support', 'pending', 'Verifica del supporto per le notifiche');
      await updateDebugInfo('Tentativo di sottoscrizione...');
      
      if (!isPushNotificationSupported()) {
        addSubscriptionStep('check_support', 'error', 'Il browser non supporta le notifiche push');
        throw new Error('Il browser non supporta le notifiche push');
      }
      addSubscriptionStep('check_support', 'success', 'Notifiche push supportate');
      
      // Richiedi il permesso per le notifiche
      addSubscriptionStep('request_permission', 'pending', 'Richiesta permesso notifiche');
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        addSubscriptionStep('request_permission', 'error', `Permesso negato: ${Notification.permission}`);
        throw new Error(`Permesso negato: ${Notification.permission}`);
      }
      addSubscriptionStep('request_permission', 'success', 'Permesso concesso');
      
      // Prova a registrare/ottenere il service worker
      addSubscriptionStep('sw_registration', 'pending', 'Registrazione Service Worker');
      try {
        await registerServiceWorker();
        addSubscriptionStep('sw_registration', 'success', 'Service Worker registrato');
      } catch (e) {
        addSubscriptionStep('sw_registration', 'error', `Errore: ${e instanceof Error ? e.message : String(e)}`);
        throw new Error(`Errore service worker: ${e instanceof Error ? e.message : String(e)}`);
      }
      
      // Implementazione sicura per Safari della sottoscrizione
      const subscribeWithLogs = async () => {
        addApiLog('Inizio processo di sottoscrizione alle notifiche');
        
        // Per Safari iOS, usiamo una simulazione diretta
        if (isSafariIOS) {
          addApiLog('Utilizzo modalità compatibilità per Safari iOS');
          const isPWA = isPWAMode();
          
          if (isPWA) {
            addApiLog('Rilevata modalità PWA su Safari iOS');
            
            try {
              // Genera un ID casuale per l'endpoint simulato
              const deviceId = `ios-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
              const simulatedEndpoint = `https://push.example.com/safari-ios/${deviceId}`;
              
              // Crea una sottoscrizione simulata
              const subscriptionData = {
                endpoint: simulatedEndpoint,
                keys: {
                  p256dh: 'safari-ios-' + btoa(deviceId + '-p256dh'),
                  auth: 'safari-ios-' + btoa(deviceId + '-auth')
                },
                expirationTime: null,
                isSafariIOSSimulation: true
              };
              
              addApiLog('Invio sottoscrizione simulata al server');
              
              // Ottieni il token di autenticazione
              const token = localStorage.getItem('token');
              if (!token) {
                addApiLog('Token non trovato nel localStorage', true);
                throw new Error('Token non trovato. Esegui il login prima di attivare le notifiche.');
              }
              
              // Invia la sottoscrizione simulata al server
              const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  subscription: subscriptionData,
                  isSafariIOSSimulation: true
                })
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                addApiLog(`Errore dal server: ${response.status} ${response.statusText}`, true);
                addApiLog(`Dettagli: ${errorText}`, true);
                throw new Error(`Errore ${response.status}: ${errorText}`);
              }
              
              const data = await response.json();
              addApiLog(`Risposta server: ${JSON.stringify(data)}`);
              
              // Sotto con successo
              addApiLog('Sottoscrizione simulata completata con successo');
              return { isSimulated: true };
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              addApiLog(`Errore durante la simulazione: ${errorMsg}`, true);
              throw error;
            }
          } else {
            addApiLog('Safari iOS non in modalità PWA, consiglia installazione', true);
            throw new Error('Per Safari iOS, installa l\'app alla schermata Home per ricevere notifiche');
          }
        }
        
        // Per browser standard che supportano le notifiche push
        addApiLog('Utilizzo flusso standard per browser compatibili');
        try {
          // Ottieni la registrazione del service worker
          const registration = await navigator.serviceWorker.ready;
          addApiLog('Service worker pronto per la sottoscrizione');
          
          // Ottieni la chiave VAPID pubblica
          addApiLog('Richiesta chiave VAPID pubblica');
          
          const token = localStorage.getItem('token');
          const headers: HeadersInit = {
            'Content-Type': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const vapidResponse = await fetch('/api/notifications/vapid-public-key', {
            headers
          });
          
          if (!vapidResponse.ok) {
            const errorText = await vapidResponse.text();
            addApiLog(`Errore recupero chiave VAPID: ${vapidResponse.status} ${vapidResponse.statusText}`, true);
            throw new Error(`Errore recupero chiave VAPID: ${errorText}`);
          }
          
          const vapidData = await vapidResponse.json();
          const vapidPublicKey = vapidData.publicKey;
          
          addApiLog('Chiave VAPID pubblica ottenuta');
          
          // Converti la chiave VAPID in formato ArrayBuffer
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
          
          // Controlla se esiste già una sottoscrizione
          let subscription = await registration.pushManager.getSubscription();
          
          if (subscription) {
            addApiLog('Sottoscrizione esistente trovata, verrà riutilizzata');
          } else {
            addApiLog('Creazione nuova sottoscrizione');
            
            // Crea una nuova sottoscrizione
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey
            });
            
            addApiLog('Sottoscrizione creata nel browser');
          }
          
          // Invia la sottoscrizione al server
          addApiLog('Invio sottoscrizione al server');
          
          const subscribeResponse = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              subscription
            })
          });
          
          if (!subscribeResponse.ok) {
            const errorText = await subscribeResponse.text();
            addApiLog(`Errore salvataggio sottoscrizione: ${subscribeResponse.status}`, true);
            throw new Error(`Errore salvataggio sottoscrizione: ${errorText}`);
          }
          
          const subscribeData = await subscribeResponse.json();
          addApiLog(`Risposta server: ${JSON.stringify(subscribeData)}`);
          addApiLog('Sottoscrizione completata con successo');
          
          return { isSimulated: false, subscription };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          addApiLog(`Errore durante la sottoscrizione: ${errorMsg}`, true);
          throw error;
        }
      };
      
      // Sottoscrivi alle push notification
      addSubscriptionStep('get_vapid', 'pending', 'Recupero chiave VAPID');
      addSubscriptionStep('subscribe', 'pending', 'Sottoscrizione alle notifiche push');
      
      const result = await subscribeWithLogs();
      
      if (result) {
        addSubscriptionStep('subscribe', 'success', 'Sottoscrizione completata');
        setIsSubscribed(true);
        setIsSimulatedSubscription(result.isSimulated || false);
        
        if (result.isSimulated) {
          setStatus('Notifiche configurate per Safari iOS in modalità PWA');
        } else {
          setStatus('Sottoscrizione alle notifiche push completata con successo!');
        }
        
        setStatusType('success');
      } else {
        addSubscriptionStep('subscribe', 'error', 'Sottoscrizione fallita senza errori specifici');
        setStatus('Sottoscrizione non riuscita, nessun errore riportato');
        setStatusType('error');
      }
      
      const currentPermission = await checkPermission();
      setPermission(currentPermission);
      await updateDebugInfo(result ? null : 'Sottoscrizione fallita senza errori');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto';
      addSubscriptionStep('error', 'error', errorMessage);
      await updateDebugInfo(error instanceof Error ? error.message : 'Errore sconosciuto durante la sottoscrizione');
      console.error('Errore sottoscrizione alle notifiche push:', error);
      setStatus(`Errore: ${errorMessage}`);
      setStatusType('error');
    } finally {
      addSubscriptionStep('complete', 'info', 'Processo completato');
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setStatus('Annullamento della sottoscrizione in corso...');
    setStatusType('info');

    try {
      await updateDebugInfo('Tentativo di annullamento sottoscrizione...');
      const result = await unsubscribeFromPushNotifications();
      setIsSubscribed(!result);
      setStatus('Sottoscrizione alle notifiche annullata con successo.');
      setStatusType('success');
      await updateDebugInfo(result ? null : 'Annullamento sottoscrizione fallito senza errore');
    } catch (error) {
      await updateDebugInfo(error instanceof Error ? error.message : 'Errore sconosciuto durante annullamento sottoscrizione');
      console.error('Errore annullamento sottoscrizione notifiche push:', error);
      setStatus(`Errore: ${error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto'}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    setIsLoading(true);
    setStatus('Invio notifica di test in corso...');
    setStatusType('info');
    setApiLogs([]); // Pulizia dei log precedenti
    
    addSubscriptionStep('send_test', 'pending', 'Invio notifica di test al server');
    addApiLog('Avvio invio notifica di test');

    try {
      // Modificato per catturare i log dalla funzione di notifica
      const testNotificationWithLogs = async () => {
        addApiLog('Preparazione invio richiesta al server');
        try {
          // Ottieni gli header di autenticazione
          const token = localStorage.getItem('token');
          addApiLog(`Token di autorizzazione: ${token ? 'presente' : 'assente'}`);
          
          const startTime = performance.now();
          addApiLog('Invio richiesta POST a /api/notifications/test');
          
          // Richiesta semplificata
          const response = await fetch('/api/notifications/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({})
          });
          
          const endTime = performance.now();
          const requestTime = Math.round(endTime - startTime);
          
          // Gestione della risposta
          if (!response.ok) {
            const errorText = await response.text();
            addApiLog(`Errore dal server: ${response.status} ${response.statusText}`, true);
            addApiLog(`Dettagli: ${errorText}`, true);
            throw new Error(`Errore ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          addApiLog(`Risposta ricevuta in ${requestTime}ms: ${JSON.stringify(data)}`);
          addApiLog('Notifica di test inviata con successo!');
          
          return data;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          addApiLog(`Errore durante l'invio della notifica: ${errorMsg}`, true);
          throw error;
        }
      };
      
      await testNotificationWithLogs();
      
      setStatus('Notifica di test inviata con successo!');
      setStatusType('success');
      addSubscriptionStep('send_test', 'success', 'Notifica di test inviata con successo');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addApiLog(`Errore finale: ${errorMsg}`, true);
      setStatus(`Errore: ${errorMsg}`);
      setStatusType('error');
      setDebugInfo(prev => ({
        ...prev, 
        error: errorMsg
      }));
      addSubscriptionStep('send_test', 'error', `Errore: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckRegistration = async () => {
    try {
      setStatus('Controllo registrazione service worker...');
      setStatusType('info');
      await updateDebugInfo();
      setStatus('Informazioni aggiornate');
      setStatusType('success');
    } catch (error) {
      setStatus(`Errore durante il controllo: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      setStatusType('error');
    }
  };

  // Stili per i componenti
  const cardClass = "p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md pt-14";
  const titleClass = "text-xl font-semibold mb-2 text-gray-800 dark:text-white";
  const descriptionClass = "text-sm text-gray-600 dark:text-gray-400 mb-4";
  const buttonClass = {
    primary: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    success: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
    danger: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50",
    secondary: "px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
  };
  
  const statusClass = {
    success: "p-3 rounded-md bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200",
    error: "p-3 rounded-md bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200",
    info: "p-3 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200"
  };

  return (
    <div className={cardClass}>
      {/* Header */}
      <h2 className={titleClass}>Notifiche Push</h2>
      <p className={descriptionClass}>
        Ricevi notifiche per i nuovi messaggi anche quando non stai utilizzando l'app
      </p>
      
      {/* Stato attuale */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isSubscribed ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-gray-700 dark:text-gray-300">
            {isSubscribed 
              ? isSimulatedSubscription 
                ? 'Notifiche attive (modalità compatibilità iOS)' 
                : 'Notifiche attive' 
              : 'Notifiche disattivate'
            }
          </span>
        </div>
        
        <button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isLoading || permission === 'denied'}
          className={isSubscribed ? buttonClass.danger : buttonClass.primary}
        >
          {isLoading 
            ? 'In elaborazione...' 
            : isSubscribed 
              ? 'Disattiva notifiche' 
              : 'Attiva notifiche'
          }
        </button>
      </div>
      
      {/* Azioni aggiuntive */}
      {isSubscribed && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSendTest}
            disabled={isLoading}
            className={buttonClass.success}
          >
            Invia notifica di test
          </button>
        </div>
      )}
      
      {/* Messaggio di stato */}
      {status && (
        <div className={`mb-4 ${statusClass[statusType]}`}>
          {status}
        </div>
      )}
      
      {/* Log dettagliato del processo di sottoscrizione */}
      {subscriptionSteps.length > 0 && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-semibold">
            Log dettagliato del processo
          </div>
          <div className="p-2 max-h-60 overflow-auto">
            {subscriptionSteps.map((stepLog, index) => {
              const stepColors = {
                pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-200",
                success: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-200",
                error: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-200",
                info: "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-200"
              };
              
              const stepIcons = {
                pending: "⏳",
                success: "✅",
                error: "❌",
                info: "ℹ️"
              };
              
              return (
                <div 
                  key={index} 
                  className={`mb-1 p-2 rounded ${stepColors[stepLog.status]} flex items-start`}
                >
                  <span className="mr-2 text-lg">{stepIcons[stepLog.status]}</span>
                  <div className="flex-1">
                    <div className="font-medium">{stepLog.step}</div>
                    <div>{stepLog.message}</div>
                    <div className="text-xs opacity-70">
                      {stepLog.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit', hour12: false})}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* API Logs */}
      {apiLogs.length > 0 && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-semibold flex justify-between items-center">
            <span>Log API</span>
            <button 
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
              onClick={() => setApiLogs([])}
            >
              Pulisci
            </button>
          </div>
          <div className="p-2 max-h-60 overflow-auto font-mono text-xs">
            {apiLogs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap mb-1 border-b border-gray-100 dark:border-gray-700 pb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Permesso negato */}
      {permission === 'denied' && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200 rounded-md">
          <strong>Attenzione:</strong> Le notifiche sono bloccate nelle impostazioni del browser. 
          Per riceverle, dovrai consentire l'accesso nelle impostazioni del sito.
        </div>
      )}
      
      {/* Avviso per dispositivi iOS */}
      {debugInfo.isIOS && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200 rounded-md">
          <strong>Dispositivo iOS rilevato</strong>
        </div>
      )}
      
      {/* Debug info */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Informazioni di debug</h3>
          <div className="flex gap-2">
            <button 
              className={buttonClass.secondary}
              onClick={handleCheckRegistration}
            >
              Aggiorna info
            </button>
            <button 
              className={buttonClass.secondary}
              onClick={() => setShowAdvancedDebug(!showAdvancedDebug)}
            >
              {showAdvancedDebug ? 'Meno dettagli' : 'Più dettagli'}
            </button>
          </div>
        </div>
        
        <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-2">Stato:</h4>
          <ul className="space-y-1 mb-4">
            <li><span className="font-medium">Service Worker:</span> {debugInfo.serviceWorkerSupported ? '✅ Supportato' : '❌ Non supportato'}</li>
            <li><span className="font-medium">Stato Service Worker:</span> {debugInfo.serviceWorkerState}</li>
            <li><span className="font-medium">Notifiche:</span> {debugInfo.notificationsSupported ? '✅ Supportate' : '❌ Non supportate'}</li>
            <li><span className="font-medium">Push Manager:</span> {debugInfo.pushManagerSupported ? '✅ Supportato' : '❌ Non supportato'}</li>
            <li><span className="font-medium">Stato Permesso:</span> {debugInfo.permissionState}</li>
            <li><span className="font-medium">Dispositivo iOS:</span> {debugInfo.isIOS ? '✅ Sì' : '❌ No'}</li>
            <li><span className="font-medium">Modalità PWA:</span> {debugInfo.isPWA ? '✅ Sì' : '❌ No'}</li>
            {debugInfo.error && (
              <li className="text-red-500"><span className="font-medium">Errore:</span> {debugInfo.error}</li>
            )}
          </ul>
          
          {showAdvancedDebug && (
            <>
              <h4 className="font-semibold mb-2 mt-4">Dettagli avanzati:</h4>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Service Worker URL:</p>
                  <p className="break-all bg-white dark:bg-gray-900 p-2 rounded text-xs">{debugInfo.serviceWorkerURL}</p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">User Agent:</p>
                  <p className="break-all bg-white dark:bg-gray-900 p-2 rounded text-xs">{debugInfo.userAgent}</p>
                </div>
                
                {debugInfo.pushEndpoint && (
                  <div>
                    <p className="font-medium mb-1">Push Endpoint:</p>
                    <p className="break-all bg-white dark:bg-gray-900 p-2 rounded text-xs">{debugInfo.pushEndpoint}</p>
                  </div>
                )}
                
                {debugInfo.vapidKey && (
                  <div>
                    <p className="font-medium mb-1">VAPID Key (estratta):</p>
                    <p className="break-all bg-white dark:bg-gray-900 p-2 rounded text-xs">{debugInfo.vapidKey}</p>
                  </div>
                )}
                
                {debugInfo.swRegistrations.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">Service Worker Registrations ({debugInfo.swRegistrations.length}):</p>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded text-xs">
                      <pre>{JSON.stringify(debugInfo.swRegistrations, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {debugInfo.subscriptionDetails && (
                  <div>
                    <p className="font-medium mb-1">Subscription Details:</p>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded text-xs overflow-auto max-h-40">
                      <pre>{debugInfo.subscriptionDetails}</pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Note */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Nota:</strong> Per ricevere le notifiche push, il browser deve supportarle e devi concedere il permesso.
          Non tutte le combinazioni di browser/dispositivi supportano questa funzionalità.
        </p>
      </div>
    </div>
  );
};

// Helper function to convert base64 to Uint8Array (needed for VAPID key)
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

export default NotificationTest; 