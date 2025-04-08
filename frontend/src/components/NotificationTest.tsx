import React, { useState } from 'react';
import { 
  isPushNotificationSupported, 
  requestNotificationPermission, 
  subscribeToPushNotifications, 
  sendTestNotification 
} from '../api/notifications';

const NotificationTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const handleSubscribe = async () => {
    setIsLoading(true);
    setStatus('Verifica del supporto per le notifiche...');
    setStatusType('info');

    try {
      // Verifica se le notifiche push sono supportate
      if (!isPushNotificationSupported()) {
        setStatus('Il tuo browser non supporta le notifiche push.');
        setStatusType('error');
        setIsLoading(false);
        return;
      }

      // Richiedi il permesso
      setStatus('Richiesta permesso per le notifiche...');
      const permission = await requestNotificationPermission();
      
      if (!permission) {
        setStatus('Permesso per le notifiche negato. Per favore abilita le notifiche nelle impostazioni del browser.');
        setStatusType('error');
        setIsLoading(false);
        return;
      }

      // Sottoscrivi alle notifiche
      setStatus('Sottoscrizione alle notifiche push in corso...');
      const subscription = await subscribeToPushNotifications();
      
      if (!subscription) {
        setStatus('Non è stato possibile sottoscrivere alle notifiche push.');
        setStatusType('error');
      } else {
        setStatus('Sottoscrizione alle notifiche push completata con successo!');
        setStatusType('success');
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Errore durante la sottoscrizione:', error);
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
      console.error('Errore durante l\'invio della notifica di test:', error);
      setStatus(`Errore: ${error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto'}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Test Notifiche Push
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={handleSubscribe}
          disabled={isLoading || isSubscribed}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'In elaborazione...' : isSubscribed ? 'Già sottoscritto' : 'Sottoscrivi alle notifiche'}
        </button>
        
        {isSubscribed && (
          <button
            onClick={handleSendTest}
            disabled={isLoading}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Invio in corso...' : 'Invia notifica di test'}
          </button>
        )}
        
        {status && (
          <div 
            className={`p-3 rounded-md ${
              statusType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
              statusType === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 
              'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            }`}
          >
            {status}
          </div>
        )}
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          <p>
            Nota: Per ricevere le notifiche push, il browser deve essere supportato e devi concedere il permesso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest; 