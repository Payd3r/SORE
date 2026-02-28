import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DownBar from './DownBar';
import MobileUploadStatus from '../components/MobileUploadStatus';
import NotificationsMobile from '../components/NotificationsMobile';
import { useUpload } from '../../contexts/UploadContext';
import { useNotificationsSummaryQuery } from '../hooks/useNotificationsQuery';
import { useReducedMotionSafe } from '../hooks/useReducedMotionSafe';

/**
 * Layout specifico per la modalità PWA
 * Utilizza solo la barra di navigazione inferiore
 */
const PwaLayout = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const { bootstrapPendingJobs } = useUpload();
  const reduceMotion = useReducedMotionSafe();
  
  // Stati per gestire le notifiche
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const { data: notificationsSummary, isLoading: notificationsSummaryLoading, refetch: refetchNotificationsSummary } = useNotificationsSummaryQuery(true);
  const unreadNotificationsCount = notificationsSummary?.unread ?? 0;
  
  useEffect(() => {
    void bootstrapPendingJobs();
  }, [bootstrapPendingJobs]);

  useEffect(() => {
    const handleOpenNotifications = () => setIsNotificationsModalOpen(true);
    window.addEventListener('sore:open-notifications', handleOpenNotifications);
    return () => window.removeEventListener('sore:open-notifications', handleOpenNotifications);
  }, []);

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

    // Stili sfondo PWA con design system (usa variabili CSS)
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
      .pwa-layout:not(.dark) .pwa-gradient-bg { background: var(--bg-page); }
      .dark.pwa-layout .pwa-gradient-bg { background: var(--bg-page); }
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

  // Quando si chiude il modale delle notifiche, aggiorna il conteggio
  const handleCloseNotificationsModal = () => {
    setIsNotificationsModalOpen(false);
    void refetchNotificationsSummary();
  };

  return (
    <div 
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden" 
    >
      {/* Sfondo gradiente */}
      <div className="pwa-gradient-bg" />

      <main 
        ref={mainRef}
        className="relative flex-1 overflow-auto overscroll-y-contain touch-pan-y pt-[max(env(safe-area-inset-top),0px)]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Barra di navigazione inferiore fissa */}
      <DownBar unreadCount={unreadNotificationsCount} unreadCountLoading={notificationsSummaryLoading} />
      
      {/* Componente per visualizzare lo stato di caricamento */}
      <MobileUploadStatus />

      {/* Bottone delle notifiche (visibile solo se ci sono notifiche non lette) */}
      {unreadNotificationsCount > 0 && !location.pathname.startsWith('/upload') && (
        <button 
          onClick={() => setIsNotificationsModalOpen(true)}
          className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg bg-[var(--color-primary)] text-white transition-all hover:bg-[var(--color-primary-hover)] active:scale-95"
          aria-label="Notifiche"
        >
          <svg 
            className="h-5 w-5"
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
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-pink)] text-xs font-bold text-white">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
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