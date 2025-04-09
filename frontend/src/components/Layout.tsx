import React, { useState, useEffect, createContext, useContext, useRef, TouchEvent } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ScrollToTop from './ScrollToTop';
import { Bars3Icon } from '@heroicons/react/24/outline';
import UploadStatus from './Images/UploadStatus';
import { useUpload } from '../contexts/UploadContext';

// Definizione del contesto Sidebar
interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Aggiungiamo uno stile globale per forzare la sidebar nascosta all'avvio
const addInitialStyles = () => {
  const style = document.createElement('style');
  style.id = 'sidebar-init-styles';
  style.innerHTML = `
    aside.sidebar {
      transform: translateX(-100%) translateZ(0) !important;
    }
    @media (prefers-reduced-motion: no-preference) {
      aside.sidebar {
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Rimuoviamo lo stile dopo un breve delay
  setTimeout(() => {
    const styleEl = document.getElementById('sidebar-init-styles');
    if (styleEl) document.head.removeChild(styleEl);
  }, 300);
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Impostiamo lo stato iniziale a false (chiuso) senza eccezioni
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Forziamo la chiusura della sidebar all'avvio dell'applicazione
  useEffect(() => {
    setSidebarOpen(false);
    // Aggiungiamo lo stile globale per forzare la sidebar nascosta
    addInitialStyles();
  }, []);
  
  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const Layout = () => {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const { uploadingFiles, showUploadStatus, setShowUploadStatus } = useUpload();
  const [isPWA, setIsPWA] = useState(false);
  
  // Aggiungiamo refs per gestire lo swipe
  const minSwipeDistance = 30; // Riduciamo ulteriormente la distanza minima per attivare lo swipe
  const sidebarWidth = 280; // Larghezza della sidebar in pixel
  const rootRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isDetailMemory = location.pathname.startsWith('/ricordo/');
  const isWelcomePage = location.pathname === '/welcome';

  // Aggiungiamo una funzione per disabilitare COMPLETAMENTE la gesture di navigazione nativa di iOS
  useEffect(() => {
    // 1. Per la pagina /welcome, blocchiamo tutte le gesture in modo aggressivo
    if (isWelcomePage) {
      const style = document.createElement('style');
      style.innerHTML = `
        html, body {
          overscroll-behavior: none !important;
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          touch-action: none !important;
        }
        
        /* Blocco specifico per iOS Safari */
        @supports (-webkit-touch-callout: none) {
          body {
            -webkit-touch-callout: none !important;
            -webkit-overflow-scrolling: none !important;
            -webkit-user-select: none !important;
          }
          
          /* Disabilita tutti gli eventi touch */
          body * {
            touch-action: none !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Aggiungiamo listener globali per bloccare TUTTI gli swipe sulla welcome page
      const blockAllGestures = (e: Event) => {
        const touchEvent = e as unknown as TouchEvent;
        if (touchEvent.touches && touchEvent.touches.length) {
          // Blocchiamo qualsiasi swipe sulla welcome page
          e.stopPropagation();
          if (touchEvent.cancelable) touchEvent.preventDefault();
        }
      };
      
      document.addEventListener('touchstart', blockAllGestures, { passive: false, capture: true });
      document.addEventListener('touchmove', blockAllGestures, { passive: false, capture: true });
      
      return () => {
        document.head.removeChild(style);
        document.removeEventListener('touchstart', blockAllGestures, { capture: true } as EventListenerOptions);
        document.removeEventListener('touchmove', blockAllGestures, { capture: true } as EventListenerOptions);
      };
    } 
    // 2. Per le altre pagine, intercettiamo solo la gesture per aprire la sidebar
    else {
      // Aggiungiamo uno stile globale per le altre pagine
      const style = document.createElement('style');
      style.innerHTML = `
        html, body {
          overscroll-behavior-x: none !important;
          overflow-x: hidden !important;
          touch-action: pan-y !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Blocco specifico per iOS Safari */
        @supports (-webkit-touch-callout: none) {
          body {
            -webkit-touch-callout: none !important;
            -webkit-overflow-scrolling: auto !important;
            -webkit-user-select: none !important;
          }
          
          /* Disabilita scrolling orizzontale */
          body * {
            touch-action: pan-y !important;
          }
          
          /* Cattura eventi sul bordo sinistro */
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 50px; 
            height: 100%;
            z-index: 9999;
            background: transparent;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Aggiungiamo meta tag specifici per il controllo del viewport e della gesture history
      const metaViewport = document.createElement('meta');
      metaViewport.name = 'viewport';
      metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(metaViewport);
      
      const metaMobileWeb = document.createElement('meta');
      metaMobileWeb.name = 'apple-mobile-web-app-capable';
      metaMobileWeb.content = 'yes';
      document.head.appendChild(metaMobileWeb);
      
      // Aggiungiamo listener globali per catturare gli eventi touch dal bordo sinistro
      // e trasformarli in apertura della sidebar
      const handleGlobalTouchStart = (e: Event) => {
        const touchEvent = e as unknown as TouchEvent;
        if (touchEvent.touches && touchEvent.touches[0]) {
          const touchX = touchEvent.touches[0].clientX;
          
          // Se siamo in una pagina di dettaglio ricordo, gestiamo il ritorno indietro
          if (isDetailMemory) {
            if (touchX < 50) {
              e.stopPropagation();
              if (touchEvent.cancelable) touchEvent.preventDefault();
              
              // Impostiamo una flag per la navigazione indietro
              (window as any).__handlingBackNavigation = true;
              (window as any).__touchStartX = touchX;
            }
          }
          // Altrimenti gestiamo l'apertura della sidebar
          else if (touchX < 50 && !sidebarOpen) {
            e.stopPropagation();
            if (touchEvent.cancelable) touchEvent.preventDefault();
            
            // Impostiamo una flag per l'apertura della sidebar
            (window as any).__handlingSidebarSwipe = true;
            (window as any).__touchStartX = touchX;
          }
        }
      };
      
      const handleGlobalTouchMove = (e: Event) => {
        // Se stiamo gestendo una navigazione indietro
        if ((window as any).__handlingBackNavigation) {
          const touchEvent = e as unknown as TouchEvent;
          if (touchEvent.touches && touchEvent.touches[0]) {
            const currentX = touchEvent.touches[0].clientX;
            const startX = (window as any).__touchStartX || 0;
            
            // Se ci stiamo muovendo verso destra
            if (currentX > startX + 5) {
              e.stopPropagation();
              if (touchEvent.cancelable) touchEvent.preventDefault();
              
              // Aggiorniamo la posizione finale
              (window as any).__touchEndX = currentX;
            }
          }
        }
        // Se stiamo gestendo l'apertura della sidebar
        else if ((window as any).__handlingSidebarSwipe) {
          const touchEvent = e as unknown as TouchEvent;
          if (touchEvent.touches && touchEvent.touches[0]) {
            const currentX = touchEvent.touches[0].clientX;
            const startX = (window as any).__touchStartX || 0;
            
            // Se ci stiamo muovendo verso destra
            if (currentX > startX + 5) {
              e.stopPropagation();
              if (touchEvent.cancelable) touchEvent.preventDefault();
              
              // Animiamo la sidebar basandoci sulla distanza con una formula più rapida
              const swipeDistance = currentX - startX;
              
              // Formula più rapida con meno resistenza
              const openPercent = Math.min(Math.pow(swipeDistance / (sidebarWidth * 0.4), 0.7), 1);
              
              const sidebarElement = document.querySelector('aside') as HTMLElement;
              if (sidebarElement && !sidebarOpen) {
                // Usiamo una transizione molto breve per dare fluidità ma evitare ritardi
                sidebarElement.style.transition = 'transform 0.05s linear, box-shadow 0.05s linear';
                
                // Aggiungiamo anche un'ombra progressiva per dare profondità
                const shadowOpacity = openPercent * 0.5; // Ombra fino al 50% di opacità
                sidebarElement.style.transform = `translateX(calc(-100% + ${openPercent * 100}%)) translateZ(0)`;
                sidebarElement.style.boxShadow = `0 0 20px rgba(0,0,0,${shadowOpacity})`;
              }
              
              // Aggiorniamo la posizione finale
              (window as any).__touchEndX = currentX;
            }
          }
        }
      };
      
      const handleGlobalTouchEnd = () => {
        // Se stiamo gestendo una navigazione indietro
        if ((window as any).__handlingBackNavigation) {
          const startX = (window as any).__touchStartX || 0;
          const endX = (window as any).__touchEndX || startX;
          const swipeDistance = endX - startX;
          
          // Se lo swipe è abbastanza ampio, navighiamo indietro
          if (swipeDistance > minSwipeDistance) {
            navigate(-1); // Torna alla pagina precedente
          }
          
          // Puliamo le flag
          (window as any).__handlingBackNavigation = false;
          (window as any).__touchStartX = 0;
          (window as any).__touchEndX = 0;
        }
        // Se stiamo gestendo l'apertura della sidebar
        else if ((window as any).__handlingSidebarSwipe) {
          const startX = (window as any).__touchStartX || 0;
          const endX = (window as any).__touchEndX || startX;
          const swipeDistance = endX - startX;
          
          // Se lo swipe è abbastanza ampio, apri la sidebar immediatamente
          if (swipeDistance > minSwipeDistance && !sidebarOpen) {
            // Animazione immediata per l'apertura finale
            const sidebarElement = document.querySelector('aside') as HTMLElement;
            if (sidebarElement) {
              // Prima rimuoviamo qualsiasi transizione per un'apertura istantanea
              sidebarElement.style.transition = 'none';
              sidebarElement.style.transform = 'translateX(0) translateZ(0)';
              
              // Questo forza il browser a applicare lo stile immediato
              sidebarElement.offsetHeight;
              
              // Poi chiamiamo setSidebarOpen che gestirà lo stato correttamente
              setSidebarOpen(true);
              
              // Rimuoviamo lo stile inline immediato per evitare conflitti con le classi CSS
              requestAnimationFrame(() => {
                sidebarElement.style.transition = '';
                sidebarElement.style.transform = '';
                sidebarElement.style.boxShadow = '';
              });
            } else {
              setSidebarOpen(true);
            }
          } else {
            // Altrimenti ripristina la posizione con un'animazione veloce
            const sidebarElement = document.querySelector('aside') as HTMLElement;
            if (sidebarElement) {
              // Animiamo il ritorno con una transizione rapida
              sidebarElement.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.15s ease-out';
              sidebarElement.style.transform = 'translateX(-100%) translateZ(0)';
              sidebarElement.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
              
              // Rimuoviamo la transizione personalizzata dopo l'animazione
              setTimeout(() => {
                sidebarElement.style.transition = '';
              }, 150);
            }
          }
          
          // Puliamo le flag
          (window as any).__handlingSidebarSwipe = false;
          (window as any).__touchStartX = 0;
          (window as any).__touchEndX = 0;
        }
      };
      
      document.addEventListener('touchstart', handleGlobalTouchStart, { passive: false, capture: true });
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false, capture: true });
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false, capture: true });
      
      // Disabilitiamo la gesture history di iOS
      if (window.history && window.history.scrollRestoration) {
        window.history.scrollRestoration = 'manual';
      }
      
      return () => {
        document.head.removeChild(style);
        document.head.removeChild(metaViewport);
        document.head.removeChild(metaMobileWeb);
        document.removeEventListener('touchstart', handleGlobalTouchStart, { capture: true } as EventListenerOptions);
        document.removeEventListener('touchmove', handleGlobalTouchMove, { capture: true } as EventListenerOptions);
        document.removeEventListener('touchend', handleGlobalTouchEnd, { capture: true } as EventListenerOptions);
      };
    }
  }, [isWelcomePage, sidebarOpen, setSidebarOpen, sidebarWidth, minSwipeDistance, navigate]);

  useEffect(() => {
    // Verifica se l'app è in modalità PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const pwaStatus = isStandalone || isFullscreen;
      setIsPWA(pwaStatus);
      
      // Se siamo in PWA, assicuriamoci che la sidebar sia chiusa
      if (pwaStatus) {
        setSidebarOpen(false);
      }
    };

    checkPWA();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWA);
    return () => window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkPWA);
  }, [setSidebarOpen]);

  // Manteniamo il comportamento di apertura sidebar allo scorrimento
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determina direzione di scroll
      setIsScrollingDown(currentScrollY > prevScrollY);
      setPrevScrollY(currentScrollY);
      
      // RIMUOVO: Non apriamo più la sidebar automaticamente durante lo scroll
      // if (!isScrollingDown && currentScrollY < prevScrollY && currentScrollY > 100) {
      //   setSidebarOpen(true);
      // }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY, isScrollingDown, setSidebarOpen]);

  // Aggiungiamo un effetto per assicurarci che la sidebar sia nascosta all'avvio
  useEffect(() => {
    // Seleziona l'elemento sidebar
    const sidebarElement = document.querySelector('aside') as HTMLElement;
    if (sidebarElement) {
      // Applica direttamente lo stile per nascondere la sidebar
      sidebarElement.style.transform = 'translateX(-100%) translateZ(0)';
      // Dopo un breve delay, rimuovi lo stile inline per permettere le transizioni CSS
      setTimeout(() => {
        sidebarElement.style.transition = '';
      }, 100);
    }
  }, []);

  // Aggiungiamo un effetto per aprire automaticamente la sidebar su desktop
  useEffect(() => {
    const handleResize = () => {
      // Se siamo su desktop e non in modalità PWA, apriamo la sidebar
      if (window.innerWidth >= 1024 && !isPWA) {
        setSidebarOpen(true);
      }
    };

    // Verifica all'avvio
    handleResize();

    // Aggiungi listener per il resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen, isPWA]);

  const handleCloseSidebar = () => {
    // Su desktop non chiudiamo la sidebar quando si clicca il pulsante di chiusura
    if (window.innerWidth >= 1024 && !isPWA) return;
    setSidebarOpen(false);
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div 
      ref={rootRef}
      className="fixed inset-0 flex flex-col bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out" 
      style={{
        height: '100%',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        touchAction: 'pan-y'
      }}
    >
      <ScrollToTop />
      {/* Gradient globale */}
      <div className="fixed top-0 left-0 right-0 h-[100px] sm:h-[200px] bg-gradient-to-b from-blue-600/10 dark:from-blue-500/10 to-transparent pointer-events-none z-0" />

      {/* Main content wrapper */}
      <div className="flex flex-1 relative" style={{ height: 'var(--vh)' }}>
        {/* Sidebar */}
        <aside className={`sidebar fixed lg:sticky top-0 inset-y-0 left-0 z-[49] transform transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] w-70 shrink-0 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${!isPWA ? 'lg:translate-x-0' : ''}`}
          style={{
            height: 'var(--vh)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            width: '280px',
            willChange: 'transform',
            transform: sidebarOpen ? 'translateX(0) translateZ(0)' : 'translateX(-100%) translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}>
          <Sidebar onClose={handleCloseSidebar} />
        </aside>

        {/* Main content area */}
        <main className="flex-1 relative" style={{
          height: 'var(--vh)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0,0,0)',
          touchAction: 'pan-y pinch-zoom'
        }}>
          <div className="min-h-full page-transition-wrapper">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Upload Status Component */}
      {showUploadStatus && (
        <UploadStatus
          show={showUploadStatus}
          uploadingFiles={uploadingFiles}
          onClose={() => setShowUploadStatus(false)}
        />
      )}

      {/* Sidebar mobile overlay - overlay che permette di chiudere la sidebar quando si tocca fuori */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[48] lg:hidden"
          onClick={handleOverlayClick}
          style={{ height: 'var(--vh)' }}
        />
      )}

      {/* Hamburger button - nascondi in modalità PWA */}
      {!isPWA && (
        <button
          onClick={() => setSidebarOpen(true)}
          className={`fixed bottom-6 left-6 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 
          transition-all duration-200 lg:hidden z-[51] outline-none focus:outline-none active:outline-none
          ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-label="Apri menu"
        >
          <Bars3Icon className="w-6 h-6 stroke-[1.5]" />
        </button>
      )}
    </div>
  );
};

export default Layout; 