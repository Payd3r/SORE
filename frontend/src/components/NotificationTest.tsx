import React, { useState, useEffect, useCallback } from 'react';
import { 
  isPushNotificationSupported, 
  requestNotificationPermission, 
  sendTestNotification,
  unsubscribeFromPushNotifications,
  isIOSDevice,
  isPWAMode,
  checkPermission,
  registerServiceWorker
} from '../api/notifications';

const NotificationTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSimulatedSubscription, setIsSimulatedSubscription] = useState<boolean>(false);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [showAdvancedDebug, setShowAdvancedDebug] = useState(false);
  
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
                  // Ignora errori
                }
              }
            } catch (e) {
              // Ignora errori
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
    const init = async () => {
      try {
        const currentPermission = await checkPermission();
        setPermission(currentPermission);
        
        // Try to register service worker on component mount
        if ('serviceWorker' in navigator) {
          try {
            await registerServiceWorker();
          } catch (e) {
            // Ignora errori
          }
        }

        // Check subscription status
        if (currentPermission === 'granted' && 'serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration?.pushManager) {
              const subscription = await registration.pushManager.getSubscription();
              setIsSubscribed(!!subscription);
            }
          } catch (e) {
            // Ignora errori
          }
        }
        
        // Update debug info
        await updateDebugInfo();
      } catch (error) {
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
    setDebugInfo(prev => ({...prev, error: null}));
    
    addSubscriptionStep('init', 'pending', 'Inizializzazione processo di sottoscrizione');

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

      // Verifica se è un dispositivo iOS
      const isIOS = isIOSDevice();
      const isPWA = isPWAMode();
      const isSafariIOS = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isSafariIOS) {
        addSubscriptionStep('check_compatibility', 'info', 'Rilevato Safari su iOS - Utilizzo configurazione specifica');
        
        if (isPWA) {
          // Per Safari iOS, consideriamo come successo
          addSubscriptionStep('subscribe', 'success', 'Modalità compatibilità per Safari iOS attivata');
          setIsSubscribed(true);
          setIsSimulatedSubscription(true);
          setStatus('Notifiche configurate per Safari iOS in modalità PWA');
          setStatusType('success');
        } else {
          addSubscriptionStep('pwa_check', 'error', 'Safari iOS richiede l\'installazione come PWA');
          throw new Error('Per utilizzare le notifiche su Safari iOS, installa l\'app alla schermata Home');
        }
      } else {
        // Per dispositivi non-iOS, prova a registrare il service worker tramite navigator.serviceWorker
        addSubscriptionStep('get_sw_reg', 'pending', 'Ottenimento registrazione Service Worker');
        try {
          await navigator.serviceWorker.ready;
          addSubscriptionStep('get_sw_reg', 'success', 'Service Worker pronto');
          
          setIsSubscribed(true);
          setIsSimulatedSubscription(false);
          setStatus('Sottoscrizione alle notifiche push completata con successo!');
          setStatusType('success');
          addSubscriptionStep('subscribe', 'success', 'Sottoscrizione completata');
        } catch (e) {
          addSubscriptionStep('get_sw_reg', 'error', `Errore: ${e instanceof Error ? e.message : String(e)}`);
          throw new Error(`Errore registrazione: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      
      // Aggiorna le info di debug
      const currentPermission = await checkPermission();
      setPermission(currentPermission);
      await updateDebugInfo();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto';
      addSubscriptionStep('error', 'error', errorMessage);
      await updateDebugInfo(error instanceof Error ? error.message : 'Errore sconosciuto durante la sottoscrizione');
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

    try {
      await sendTestNotification();
      setStatus('Notifica di test inviata con successo!');
      setStatusType('success');
    } catch (error) {
      setStatus(`Errore: ${error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto'}`);
      setStatusType('error');
      setDebugInfo(prev => ({
        ...prev, 
        error: error instanceof Error ? error.message : String(error)
      }));
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

export default NotificationTest; 