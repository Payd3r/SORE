import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ScrollToTop from './ScrollToTop';
import { Bars3Icon } from '@heroicons/react/24/outline';
import UploadStatus from './Images/UploadStatus';
import { useUpload } from '../contexts/UploadContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const { uploadingFiles, showUploadStatus, setShowUploadStatus } = useUpload();
  
  const location = useLocation();
  const navigate = useNavigate();
  const isDetailMemory = location.pathname.startsWith('/ricordo/');
  const isWelcomePage = location.pathname === '/welcome';

  useEffect(() => {
    // Verifica se l'app è in modalità PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const pwaStatus = isStandalone || isFullscreen;
      setIsPWA(pwaStatus);
    };

    checkPWA();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWA);
    return () => window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkPWA);
  }, []);

  useEffect(() => {
    if (!isPWA || isWelcomePage) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;
    let startTime = 0;
    let touchDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      startTime = Date.now();
      
      // Abilita lo swipe solo se il tocco inizia dal bordo sinistro (per aprire sidebar)
      // o se siamo nella pagina di dettaglio (per tornare indietro)
      if (touchStartX < 50 || isDetailMemory) {
        e.preventDefault();
        isSwiping = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      touchDistance = Math.abs(deltaX);
      
      // Se il movimento è più orizzontale che verticale
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        e.preventDefault(); // Previene lo scroll verticale durante lo swipe orizzontale
        
        // Applica un effetto visuale durante lo swipe
        if (isDetailMemory && deltaX > 0) {
          // Effetto di trascinamento per il back gesture
          const percentage = Math.min(deltaX / window.innerWidth, 0.3);
          document.body.style.setProperty('--swipe-offset', `${percentage * 100}%`);
        } else if (deltaX > 0 && !isDetailMemory) {
          // Effetto di apertura sidebar
          setIsSidebarOpen(deltaX > window.innerWidth * 0.15);
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;
      
      const deltaX = touchEndX - touchStartX;
      const swipeTime = Date.now() - startTime;
      const velocity = touchDistance / swipeTime;
      
      // Considera sia la distanza che la velocità per determinare se lo swipe è intenzionale
      const isSignificantSwipe = deltaX > 70 || (deltaX > 30 && velocity > 0.5);
      
      if (Math.abs(deltaX) > Math.abs(touchEndY - touchStartY) && deltaX > 0) {
        if (isDetailMemory && isSignificantSwipe) {
          document.body.style.setProperty('--swipe-offset', '0');
          navigate(-1); // Torna indietro nella navigazione
        } else if (!isDetailMemory && isSignificantSwipe) {
          setIsSidebarOpen(true);
        } else if (isDetailMemory) {
          // Ripristina la posizione se lo swipe non è completo
          document.body.style.setProperty('--swipe-offset', '0');
        }
      }
      
      isSwiping = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Aggiungi stile CSS per gestire l'effetto di transizione
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body {
        --swipe-offset: 0;
      }
      .page-transition-wrapper {
        transform: translateX(var(--swipe-offset));
        transition: transform 0.3s ease;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.head.removeChild(styleElement);
      document.body.style.removeProperty('--swipe-offset');
    };
  }, [isPWA, isDetailMemory, navigate]);

  // Aggiungiamo anche un meta tag per disabilitare il gesto di navigazione iOS
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out" style={{
      height: 'var(--vh)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    }}>
      <ScrollToTop />
      {/* Gradient globale */}
      <div className="fixed top-0 left-0 right-0 h-[100px] sm:h-[200px] bg-gradient-to-b from-blue-600/10 dark:from-blue-500/10 to-transparent pointer-events-none z-0" />

      {/* Main content wrapper */}
      <div className="flex flex-1 relative" style={{ height: 'var(--vh)' }}>
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 inset-y-0 left-0 z-[49] transform transition-transform duration-300 ease-in-out w-70 shrink-0 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{
            height: 'var(--vh)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
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

      {/* Sidebar mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[48] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          style={{ height: 'var(--vh)' }}
        />
      )}

      {/* Hamburger button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed bottom-6 left-6 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 
        transition-all duration-200 lg:hidden z-[51] outline-none focus:outline-none active:outline-none
        ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Apri menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Layout; 