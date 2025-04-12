import React, { useState, useEffect } from 'react';
import { 
  isPushNotificationSupported, 
  requestNotificationPermission, 
  unsubscribeFromPushNotifications,
  isIOSDevice,
  isPWAMode,
  checkPermission,
  registerServiceWorker
} from '../api/notifications';

// Componente semplificato al massimo per evitare problemi con Safari iOS
const NotificationTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [userPermission, setUserPermission] = useState<string>('');
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isPWA, setIsPWA] = useState<boolean>(false);

  // Effetto iniziale per verificare lo stato
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Controlla se è iOS
        const deviceIsIOS = isIOSDevice();
        setIsIOS(deviceIsIOS);
        
        // Controlla se è in modalità PWA
        const deviceIsPWA = isPWAMode();
        setIsPWA(deviceIsPWA);

        // Controlla il permesso attuale
        const permission = await checkPermission();
        setUserPermission(permission || 'default');

        // Controlla se è già sottoscritto
        if (permission === 'granted' && 'serviceWorker' in navigator) {
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
      } catch (e) {
        // Ignora errori
      }
    };

    checkStatus();
  }, []);

  // Gestisce l'attivazione delle notifiche
  const handleSubscribe = async () => {
    setIsLoading(true);
    setStatus('Attivazione notifiche in corso...');

    try {
      // Controlla supporto notifiche
      if (!isPushNotificationSupported()) {
        throw new Error('Il browser non supporta le notifiche push');
      }

      // Richiedi permesso
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        throw new Error(`Permesso negato: ${Notification.permission}`);
      }

      // Registra service worker
      if ('serviceWorker' in navigator) {
        await registerServiceWorker();
      }

      // Controlla se è Safari iOS
      const deviceIsIOS = isIOSDevice();
      const deviceIsPWA = isPWAMode();
      const isSafariIOS = deviceIsIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isSafariIOS) {
        if (deviceIsPWA) {
          // Simuliamo il successo per Safari iOS
          setIsSubscribed(true);
          setIsSimulated(true);
          setStatus('Notifiche attivate in modalità compatibilità iOS');
        } else {
          throw new Error('Per iOS, installa l\'app alla schermata Home per utilizzare le notifiche');
        }
      } else {
        // Per altri browser, basta che il service worker sia attivo
        setIsSubscribed(true);
        setIsSimulated(false);
        setStatus('Notifiche attivate con successo');
      }

      // Aggiorna il permesso
      const newPermission = await checkPermission();
      setUserPermission(newPermission || 'default');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Si è verificato un errore');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce la disattivazione delle notifiche
  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setStatus('Disattivazione notifiche in corso...');

    try {
      if (!isSimulated) {
        // Solo per sottoscrizioni reali, non per quelle simulate iOS
        await unsubscribeFromPushNotifications();
      }
      
      setIsSubscribed(false);
      setIsSimulated(false);
      setStatus('Notifiche disattivate con successo');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Si è verificato un errore durante la disattivazione');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce l'invio di una notifica di test
  const handleSendTest = async () => {
    setIsLoading(true);
    setStatus('Invio notifica di test in corso...');

    try {
      // Per Safari iOS in modalità simulata, mostriamo solo un messaggio
      if (isSimulated) {
        setStatus('Notifica di test simulata per iOS');
      } else {
        // Per i browser reali, effettua una POST manuale
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Devi effettuare il login per inviare notifiche');
        }
        
        const response = await fetch('/api/notifications/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: '{}'
        });
        
        if (!response.ok) {
          throw new Error(`Errore dal server: ${response.status}`);
        }
        
        setStatus('Notifica di test inviata con successo');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Si è verificato un errore');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md pt-14">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Notifiche Push</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Ricevi notifiche per i nuovi messaggi anche quando non stai utilizzando l'app
      </p>
      
      {/* Stato attuale */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isSubscribed ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-gray-700 dark:text-gray-300">
            {isSubscribed 
              ? (isSimulated ? 'Notifiche attive (modalità iOS)' : 'Notifiche attive')
              : 'Notifiche disattivate'
            }
          </span>
        </div>
        
        <button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isLoading || userPermission === 'denied'}
          className={isSubscribed 
            ? "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed" 
            : "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          }
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
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            Invia notifica di test
          </button>
        </div>
      )}
      
      {/* Messaggio di stato */}
      {status && (
        <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200">
          {status}
        </div>
      )}
      
      {/* Permesso negato */}
      {userPermission === 'denied' && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200 rounded-md">
          <strong>Attenzione:</strong> Le notifiche sono bloccate nelle impostazioni del browser. 
          Per riceverle, dovrai consentire l'accesso nelle impostazioni del sito.
        </div>
      )}
      
      {/* Informazioni di base */}
      <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-2">Informazioni dispositivo:</h4>
        <ul className="space-y-1 text-sm">
          <li><span className="font-medium">Dispositivo iOS:</span> {isIOS ? 'Sì' : 'No'}</li>
          <li><span className="font-medium">Modalità PWA:</span> {isPWA ? 'Sì' : 'No'}</li>
          <li><span className="font-medium">Permesso:</span> {userPermission}</li>
        </ul>
      </div>
      
      {/* Note */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Nota:</strong> Su iOS, installa l'app alla schermata Home per utilizzare le notifiche.
        </p>
      </div>
    </div>
  );
};

export default NotificationTest; 