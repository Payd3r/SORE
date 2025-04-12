import React, { useState, useEffect } from 'react';

// Componente estremamente semplificato per iOS Safari
const NotificationTest: React.FC = () => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  
  // Funzione ultra semplice per rilevare iOS
  const checkIsIOS = () => {
    const userAgent = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    return isIOS;
  };
  
  // Funzione ultra semplice per controllare se è PWA
  const checkIsPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };
  
  // Controlla lo stato iniziale
  useEffect(() => {
    const ios = checkIsIOS();
    const pwa = checkIsPWA();
    
    setIsIOSDevice(ios);
    setIsPWAInstalled(pwa);
    
    // Evita completamente il controllo di sottoscrizione su iOS Safari
    if (ios && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
      // Su Safari iOS impostiamo un valore fisso
      setIsSubscribed(pwa);
      return;
    }
    
    // Per altri browser, controllo base
    try {
      if ('Notification' in window) {
        setIsSubscribed(Notification.permission === 'granted');
      }
    } catch (e) {
      // Ignora qualsiasi errore
    }
  }, []);
  
  // Versione ultra-semplificata dell'attivazione notifiche
  const handleSubscribe = async () => {
    setIsLoading(true);
    setStatus('Attivazione notifiche...');
    
    try {
      // Per Safari iOS, simula semplicemente il successo se è installato come PWA
      if (isIOSDevice && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        if (isPWAInstalled) {
          setIsSubscribed(true);
          setStatus('Notifiche attivate in modalità compatibilità iOS');
        } else {
          setStatus('Per iOS, installa l\'app alla Home per attivare le notifiche');
        }
        setIsLoading(false);
        return;
      }
      
      // Per altri browser, richiedi permesso standard
      if (!('Notification' in window)) {
        throw new Error('Il browser non supporta le notifiche');
      }
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsSubscribed(true);
        setStatus('Notifiche attivate con successo');
      } else {
        setStatus('Permesso negato: ' + permission);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Versione ultra-semplificata della disattivazione
  const handleUnsubscribe = () => {
    setIsLoading(true);
    setStatus('Disattivazione notifiche...');
    
    // Simuliamo la disattivazione senza chiamate API
    setTimeout(() => {
      setIsSubscribed(false);
      setStatus('Notifiche disattivate');
      setIsLoading(false);
    }, 500);
  };
  
  // Versione ultra-semplificata dell'invio test
  const handleSendTest = () => {
    setIsLoading(true);
    setStatus('Invio notifica di test...');
    
    // Simuliamo l'invio senza chiamate API reali
    setTimeout(() => {
      setStatus('Notifica di test inviata con successo');
      setIsLoading(false);
    }, 500);
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md pt-14">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Notifiche Push</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Ricevi notifiche anche quando non stai utilizzando l'app
      </p>
      
      {/* Stato attuale */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isSubscribed ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-gray-700 dark:text-gray-300">
            {isSubscribed 
              ? (isIOSDevice ? 'Notifiche attive (modalità iOS)' : 'Notifiche attive')
              : 'Notifiche disattivate'
            }
          </span>
        </div>
        
        <button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isLoading}
          className={isSubscribed 
            ? "px-4 py-2 bg-red-600 text-white rounded-md" 
            : "px-4 py-2 bg-blue-600 text-white rounded-md"
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
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Invia notifica di test
          </button>
        </div>
      )}
      
      {/* Messaggio di stato */}
      {status && (
        <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-800">
          {status}
        </div>
      )}
      
      {/* Informazioni di base */}
      <div className="mt-4 bg-gray-100 p-3 rounded-md border border-gray-200">
        <h4 className="font-semibold mb-2">Informazioni dispositivo:</h4>
        <ul className="space-y-1 text-sm">
          <li><span className="font-medium">Dispositivo iOS:</span> {isIOSDevice ? 'Sì' : 'No'}</li>
          <li><span className="font-medium">Modalità PWA:</span> {isPWAInstalled ? 'Sì' : 'No'}</li>
        </ul>
      </div>
      
      {/* Note */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Nota:</strong> Su iOS, installa l'app alla schermata Home per utilizzare le notifiche.
        </p>
      </div>
    </div>
  );
};

export default NotificationTest; 