import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DownBar from './DownBar';
import MobileUploadStatus from '../components/MobileUploadStatus';
import NotificationsMobile from '../components/NotificationsMobile';
import { getNotifications } from '../../api/notifications';

/**
 * Layout specifico per la modalità PWA
 * Utilizza solo la barra di navigazione inferiore
 */
const PwaLayout = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Stati per gestire le notifiche
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  
  // Carica le notifiche all'apertura della PWA
  useEffect(() => {
    fetchNotificationsCount();
    
    // Imposta un intervallo per controllare periodicamente le nuove notifiche
    const intervalId = setInterval(fetchNotificationsCount, 60000); // ogni minuto
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Funzione per recuperare il conteggio delle notifiche non lette
  const fetchNotificationsCount = async () => {
    try {
      const response = await getNotifications(1, 0); // Richiedi solo 1 notifica, ci interessa solo il conteggio
      setUnreadNotificationsCount(response.unread);
    } catch (error) {
      console.error('Errore nel recupero delle notifiche:', error);
    }
  };

  // Disattiva tutte le gesture di swipe per la sidebar
  useEffect(() => {
    // Rimuovi la sidebar dal DOM (se presente)
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.style.display = 'none';
    }

    // Aggiunge classi CSS specifiche per la modalità PWA
    document.body.classList.add('pwa-layout');
    document.documentElement.classList.add('pwa-layout');

    // Aggiungi stili per i gradienti di sfondo
    const style = document.createElement('style');
    style.innerHTML = `
      .pwa-layout .pwa-gradient-bg {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        pointer-events: none;
      }
      
      /* Gradiente chiaro - fucsia e azzurro */
      .pwa-layout:not(.dark) .pwa-gradient-bg {
        background: linear-gradient(135deg, rgba(219, 39, 119, 0.1) 0%, rgba(147, 197, 253, 0.1) 50%, rgba(37, 99, 235, 0.1) 100%);
      }
      
      /* Gradiente scuro - sfumature di blu */
      .dark.pwa-layout .pwa-gradient-bg {
        background: linear-gradient(135deg, rgba(11, 68, 99, 0.1) 0%, rgba(0, 45, 70, 0.1) 50%, rgba(6, 28, 41, 0.1) 100%);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Ripristina la visibilità della sidebar quando il componente viene smontato
      if (sidebar) {
        sidebar.style.display = '';
      }
      document.body.classList.remove('pwa-layout');
      document.documentElement.classList.remove('pwa-layout');
      
      // Rimuovi lo stile del gradiente
      document.head.removeChild(style);
    };
  }, []);

  // Blocca le gesture di swipe di default del browser (indietro/avanti)
  useEffect(() => {
    const preventSwipeNavigation = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      // Blocca swipe da bordo sinistro o destro (tipico per back/forward)
      if (touch.clientX < 30 || touch.clientX > window.innerWidth - 30) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchstart', preventSwipeNavigation, { passive: false });
    return () => {
      document.removeEventListener('touchstart', preventSwipeNavigation);
    };
  }, []);

  // Quando si chiude il modale delle notifiche, aggiorna il conteggio
  const handleCloseNotificationsModal = () => {
    setIsNotificationsModalOpen(false);
    fetchNotificationsCount(); // Aggiorna il conteggio delle notifiche non lette
  };

  return (
    <div 
      className="flex flex-col w-full h-[100dvh] relative overflow-hidden" 
    >
      {/* Sfondo gradiente */}
      <div className="pwa-gradient-bg" />

      <main 
        ref={mainRef}
        className="flex-1 overflow-auto overscroll-none relative touch-pan-y"
      >
        <Outlet />
      </main>
      
      {/* Barra di navigazione inferiore fissa */}
      <DownBar />
      
      {/* Componente per visualizzare lo stato di caricamento */}
      <MobileUploadStatus />

      {/* Bottone delle notifiche (visibile solo se ci sono notifiche non lette) */}
      {unreadNotificationsCount > 0 && !location.pathname.startsWith('/upload') && (
        <button 
          onClick={() => setIsNotificationsModalOpen(true)}
          className="fixed bottom-20 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-blue-500 text-white"
          aria-label="Notifiche"
        >
          <svg 
            className="w-5 h-5"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>
      )}
      
      {/* Componente modale per visualizzare le notifiche */}
      <NotificationsMobile 
        isOpen={isNotificationsModalOpen} 
        onClose={handleCloseNotificationsModal} 
      />
    </div>
  );
};

export default PwaLayout; 