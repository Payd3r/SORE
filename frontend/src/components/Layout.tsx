import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ScrollToTop from './ScrollToTop';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isDetailMemory = location.pathname.startsWith('/ricordo/');

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
    if (!isPWA) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      
      if (touchStartX < 50) {
        e.preventDefault();
        isSwiping = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      
      e.preventDefault();
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      if (touchStartX < 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        
        if (deltaX > 30) {
          if (isDetailMemory) {
            navigate(-1); // Torna indietro nella navigazione
          } else {
            setIsSidebarOpen(true);
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isSwiping) {
        e.preventDefault();
      }
      isSwiping = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
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
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

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