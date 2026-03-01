import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import '../../styles/mobile-pwa.css';
import DownBar from './DownBar';
import MobileUploadStatus from '../components/MobileUploadStatus';
import { useUpload } from '../../contexts/UploadContext';
import { useNotificationsSummaryQuery } from '../hooks/useNotificationsQuery';
import { useReducedMotionSafe } from '../hooks/useReducedMotionSafe';

/**
 * Layout specifico per la modalità PWA
 * Utilizza solo la barra di navigazione inferiore
 */
const PwaLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  const { bootstrapPendingJobs } = useUpload();
  const reduceMotion = useReducedMotionSafe();
  const { data: notificationsSummary, isLoading: notificationsSummaryLoading } = useNotificationsSummaryQuery(true);
  const unreadNotificationsCount = notificationsSummary?.unread ?? 0;

  useEffect(() => {
    void bootstrapPendingJobs();
  }, [bootstrapPendingJobs]);

  // Disattiva tutte le gesture di swipe per la sidebar e applica classi PWA
  useEffect(() => {
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.style.display = 'none';
    }

    document.body.classList.add('pwa-layout', 'pwa-mode');
    document.documentElement.classList.add('pwa-layout');

    return () => {
      if (sidebar) {
        sidebar.style.display = '';
      }
      document.body.classList.remove('pwa-layout', 'pwa-mode');
      document.documentElement.classList.remove('pwa-layout');
    };
  }, []);

  const handleOpenNotifications = () => {
    navigate('/', { state: { openNotifications: true } });
  };

  return (
    <div
      className="pwa-root relative flex min-h-[100dvh] w-full flex-col overflow-visible"
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
          onClick={handleOpenNotifications}
          className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-[var(--shadow-lg)] bg-[var(--color-primary)] text-[var(--text-inverse)] transition-all hover:bg-[var(--color-primary-hover)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          aria-label="Notifiche"
        >
          <span className="material-symbols-outlined text-2xl" aria-hidden>
            notifications
          </span>
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-pink)] text-xs font-bold text-white">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        </button>
      )}
    </div>
  );
};

export default PwaLayout; 