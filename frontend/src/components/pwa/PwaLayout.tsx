import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DownBar from './DownBar';
import MobileUploadStatus from '../mobile/MobileUploadStatus';
import NotificationsMobile from '../mobile/NotificationsMobile';
import { getNotifications } from '../../api/notifications';

// Ordine delle pagine per la navigazione con swipe
const pageOrder = ['/', '/galleria', '/mappa', '/profilo'];

// Percorsi in cui disabilitare le gesture di swipe
const disabledSwipePaths = ['/ricordo/', '/upload' , '/mappa'];

/**
 * Layout specifico per la modalità PWA
 * Utilizza solo la barra di navigazione inferiore
 */
const PwaLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  const [targetPage, setTargetPage] = useState<string | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const touchStartY = useRef<number | null>(null);
  
  // Stati per gestire le notifiche
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  
  // Trova l'indice della pagina corrente
  const currentPageIndex = pageOrder.indexOf(location.pathname) !== -1 
    ? pageOrder.indexOf(location.pathname) 
    : 0;
    
  // Verifica se le gesture di swipe sono disabilitate per il percorso corrente
  const isSwipeDisabled = disabledSwipePaths.some(path => location.pathname.includes(path));

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

  // Gestione dello swipe orizzontale per la navigazione tra pagine (semplificata)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Se siamo in un percorso in cui le gesture sono disabilitate, non fare nulla
    if (isSwipeDisabled) return;
    
    // Memorizza la posizione iniziale del touch
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Se siamo in un percorso in cui le gesture sono disabilitate, non fare nulla
    if (isSwipeDisabled) return;
    
    // Se non abbiamo un punto di partenza o siamo in animazione, usciamo
    if (touchStartX.current === null || touchStartY.current === null || isAnimating) return;
    
    // Ottieni la posizione attuale
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    // Calcola distanze
    const deltaX = touchX - touchStartX.current;
    const deltaY = Math.abs(touchY - touchStartY.current);
    
    // Verifica se lo swipe è principalmente verticale
    // Se è così, lascia che la pagina gestisca lo scrolling e annulla lo swipe
    const isVerticalSwipe = deltaY > Math.abs(deltaX * 1.2);
    if (isVerticalSwipe) return;
    
    // Se lo swipe è significativo e principalmente orizzontale 
    if (Math.abs(deltaX) > 20 && !isVerticalSwipe) {
      // Calcola la direzione dello swipe
      const direction = deltaX > 0 ? 'right' : 'left';
      const directionIndex = direction === 'right' ? -1 : 1;
      
      // Calcola l'indice della pagina di destinazione
      const targetIndex = Math.max(0, Math.min(pageOrder.length - 1, currentPageIndex + directionIndex));
      
      // Se siamo al limite, ignora lo swipe
      if (
        (currentPageIndex === 0 && direction === 'right') || 
        (currentPageIndex === pageOrder.length - 1 && direction === 'left')
      ) {
        return;
      }
      
      // Aggiorna lo stato
      setSwipeDistance(deltaX);
      setAnimationDirection(direction);
      setTargetPage(pageOrder[targetIndex]);
      
      // Previeni lo scrolling verticale solo durante swipe orizzontali significativi
      if (Math.abs(deltaX) > 40) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    // Se siamo in un percorso in cui le gesture sono disabilitate, non fare nulla
    if (isSwipeDisabled) return;
    
    // Se non abbiamo memorizzato un punto di partenza o non c'è un'animazione in corso, reset
    if (touchStartX.current === null || !animationDirection || !targetPage) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      setSwipeDistance(0);
      setAnimationDirection(null);
      setTargetPage(null);
      return;
    }
    
    // Determina se lo swipe è abbastanza lungo per cambiare pagina (25%)
    const threshold = window.innerWidth * 0.25;
    
    if (Math.abs(swipeDistance) > threshold) {
      // Attiva l'animazione
      setIsAnimating(true);
      
      // Calcola la distanza finale per l'animazione
      const finalDistance = animationDirection === 'right' ? window.innerWidth : -window.innerWidth;
      setSwipeDistance(finalDistance);
      
      // Naviga alla pagina di destinazione
      setTimeout(() => {
        navigate(targetPage);
        
        // Reset lo stato dopo la navigazione
        setTimeout(() => {
          setIsAnimating(false);
          setSwipeDistance(0);
          setAnimationDirection(null);
          setTargetPage(null);
          touchStartX.current = null;
          touchStartY.current = null;
          touchEndX.current = null;
        }, 50);
      }, 250);
    } else {
      // Se lo swipe non è abbastanza lungo, torna alla posizione iniziale
      setIsAnimating(true);
      setSwipeDistance(0);
      
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
        setTargetPage(null);
        touchStartX.current = null;
        touchStartY.current = null;
        touchEndX.current = null;
      }, 250);
    }
  };

  // Calcola lo stile per l'animazione
  const getAnimationStyle = () => {
    if (!animationDirection) return {};
    
    // Calcola quanto mostrare della pagina che sta entrando
    const translateX = `${swipeDistance}px`;    
    
    // Aggiungiamo un leggero effetto di rotazione 3D per un aspetto più realistico
    const rotateY = isAnimating
      ? 0
      : (swipeDistance / window.innerWidth) * 1.5; // Ridotto a 1.5 gradi per un effetto più sottile
    
    return {
      transform: `translateX(${translateX}) perspective(1200px) rotateY(${rotateY}deg)`,
      opacity: 1, // Manteniamo l'opacità sempre a 1 per evitare problemi
      transition: isAnimating 
        ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' 
        : 'none',
      willChange: 'transform',
      backfaceVisibility: 'hidden' as 'hidden',
      WebkitBackfaceVisibility: 'hidden' as 'hidden',
    };
  };

  useEffect(() => {
    // Blocca solo il rimbalzo elastico di iOS ai bordi del documento
    const preventBounce = (event: TouchEvent) => {
      // Verifica se l'elemento target o un suo genitore è scrollabile
      const isScrollableElement = (element: Element | null): boolean => {
        if (!element) return false;
        
        // Verifica attributo data-scrollable
        if (element.getAttribute('data-scrollable') === 'true') return true;

        // Verifica se l'elemento è scrollabile
        const style = window.getComputedStyle(element);
        const overflowY = style.getPropertyValue('overflow-y');
        const isScrollable = overflowY === 'scroll' || overflowY === 'auto';
        
        // Verifica se l'elemento ha scrollbar attiva
        const hasScrollbar = element.scrollHeight > element.clientHeight;
        
        if (isScrollable && hasScrollbar) return true;
        
        // Controlla ricorsivamente il genitore
        return isScrollableElement(element.parentElement);
      };

      // Ottieni l'elemento target
      const target = event.target as Element;
      
      // Se l'evento è all'interno di un elemento scrollabile, permetti lo scroll normale
      if (isScrollableElement(target)) {
        return;
      }
      
      // Altrimenti previeni il bounce
      event.preventDefault();
    };
    
    // Inizializza il tracciamento del touch
    (window as any).__lastTouchY = null;
    
    // Gestisci l'inizio del touch
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        (window as any).__lastTouchY = e.touches[0].clientY;
      }
    };
    
    // Aggiungi gli event listener
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', preventBounce, { passive: false });
    
    // Imposta proprietà CSS utili
    document.documentElement.style.setProperty('--webkit-tap-highlight-color', 'transparent');
    document.documentElement.style.setProperty('touch-action', 'manipulation');
    
    return () => {
      // Rimuovi gli event listener quando il componente viene smontato
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', preventBounce);
      
      // Ripristina le proprietà CSS
      document.documentElement.style.removeProperty('--webkit-tap-highlight-color');
      document.documentElement.style.removeProperty('touch-action');
      
      // Pulisci le variabili globali
      (window as any).__lastTouchY = undefined;
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sfondo gradiente */}
      <div className="pwa-gradient-bg" />

      <main 
        ref={mainRef}
        className="flex-1 overflow-auto overscroll-none relative touch-pan-y"
        style={getAnimationStyle()}
        data-scrollable="true"
      >
        <Outlet />
      </main>
      
      {/* Barra di navigazione inferiore fissa */}
      <DownBar />
      
      {/* Componente per visualizzare lo stato di caricamento */}
      <MobileUploadStatus />

      {/* Bottone delle notifiche (visibile solo se ci sono notifiche non lette) */}
      {unreadNotificationsCount > 0 && (
        <button 
          onClick={() => setIsNotificationsModalOpen(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-blue-500 text-white"
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