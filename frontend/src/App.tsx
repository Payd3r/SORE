import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UploadProvider } from './contexts/UploadContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import { Suspense, lazy, useEffect } from 'react';
import Layout from './components/Layout';
import { SidebarProvider } from './components/Layout';
import Loader from './components/Loader';
import { useIsPwa } from './utils/isPwa';
import MappaMobile from './components/mobile/MappaMobile';

// Lazy loading delle pagine
const WelcomeAuthenticate = lazy(() => import('./pages/WelcomeAuthenticate'));
const Home = lazy(() => import('./pages/Home'));
const HomeMobile = lazy(() => import('./components/mobile/HomeMobile'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileMobile = lazy(() => import('./components/mobile/ProfileMobile'));
const Gallery = lazy(() => import('./pages/Gallery'));
const GalleryMobile = lazy(() => import('./components/mobile/GalleryMobile'));
const Memory = lazy(() => import('./pages/Memory'));
const DetailMemory = lazy(() => import('./pages/DetailMemory'));
const DetailMemoryMobile = lazy(() => import('./components/mobile/DetailMemoryMobile'));
const Ideas = lazy(() => import('./pages/Ideas'));
const Recap = lazy(() => import('./pages/Recap'));
const Mappa = lazy(() => import('./pages/Mappa'));
const UploadMobile = lazy(() => import('./components/mobile/UploadMobile'));

// Layout PWA
const PwaLayout = lazy(() => import('./components/pwa/PwaLayout'));

// Componente che sceglie quale versione della Home mostrare
const HomeSelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <HomeMobile /> : <Home />;
};

// Componente che sceglie quale versione della Galleria mostrare
const GallerySelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <GalleryMobile /> : <Gallery />;
};


// Per altre pagine che potrebbero avere una versione mobile in futuro
const MappaSelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <MappaMobile /> : <Mappa />;
};

const MemorySelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <Memory /> : <Memory />;
};

const DetailMemorySelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <DetailMemoryMobile /> : <DetailMemory />;
};

const ProfileSelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <ProfileMobile /> : <Profile />;
};

// Layout Selector - sceglie quale layout utilizzare in base alla modalità
const LayoutSelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <PwaLayout /> : <Layout />;
};

function App() {
  const isPwa = useIsPwa();

  useEffect(() => {
    // Se non è in PWA mode, inizializza la sidebar
    if (!isPwa) {
      // Assicuriamoci che la sidebar sia nascosta all'avvio
      const initApp = () => {
        // Questa funzione aiuta a forzare la sidebar chiusa per risolvere il problema di visualizzazione
        const sidebarElement = document.querySelector('aside') as HTMLElement;
        if (sidebarElement) {
          sidebarElement.style.transform = 'translateX(-100%) translateZ(0)';
        }
      };

      // Esegui subito per forzare la sidebar chiusa
      initApp();

      // Esegui anche dopo un breve ritardo per assicurarsi che funzioni dopo il rendering completo
      setTimeout(initApp, 100);
    }

    // Forza viewport height
    const forceViewportHeight = () => {
      // Calcola l'altezza reale del viewport su iOS
      const vh = window.screen.height;
      const vw = window.screen.width;

      // Imposta le variabili CSS
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--vw', `${vw}px`);

      // Forza le dimensioni del viewport
      document.documentElement.style.height = `${vh}px`;
      document.documentElement.style.width = `${vw}px`;
      document.body.style.height = `${vh}px`;
      document.body.style.width = `${vw}px`;

      // Blocca lo scroll del body ma permetti lo scroll nei contenitori
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.overflow = 'hidden';

      // Forza il viewport per iOS
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, ' +
          'height=' + vh + ', minimal-ui'
        );
      }

      // Aggiungi meta tag specifici per iOS
      const addMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Meta tag specifici per iOS
      addMetaTag('apple-mobile-web-app-capable', 'yes');
      addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
      addMetaTag('apple-mobile-web-app-title', 'SORE');
      addMetaTag('mobile-web-app-capable', 'yes');

      // Forza il rendering a fullscreen su iOS
      if ('standalone' in window.navigator && !(window.navigator as any).standalone) {
        Object.defineProperty(window.navigator, 'standalone', {
          get: () => true,
          configurable: true
        });
      }
    };

    // Esegui subito
    forceViewportHeight();

    // Aggiungi listener per vari eventi
    window.addEventListener('resize', forceViewportHeight);
    window.addEventListener('orientationchange', forceViewportHeight);
    window.visualViewport?.addEventListener('resize', forceViewportHeight);

    // Forza l'aggiornamento periodicamente
    const interval = setInterval(forceViewportHeight, 1000);

    return () => {
      window.removeEventListener('resize', forceViewportHeight);
      window.removeEventListener('orientationchange', forceViewportHeight);
      window.visualViewport?.removeEventListener('resize', forceViewportHeight);
      clearInterval(interval);
    };
  }, [isPwa]);

  // Aggiunge classi specifiche al body quando in modalità PWA
  useEffect(() => {
    if (isPwa) {
      document.body.classList.add('pwa-mode');
    } else {
      document.body.classList.remove('pwa-mode');
    }
  }, [isPwa]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UploadProvider>
          <SidebarProvider>
            <Router>
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: 'var(--vw)',
                height: 'var(--vh)',
                overflow: 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}>
                <Suspense fallback={
                  <Loader
                    type="spinner"
                    size="lg"
                    fullScreen
                    text="Caricamento in corso..."
                    subText="Stiamo preparando l'app per te"
                  />
                }>
                  <Routes>
                    <Route path="/welcome" element={<WelcomeAuthenticate />} />
                    <Route element={<ProtectedRoute />}>
                      <Route element={<LayoutSelector />}>
                        <Route path="/" element={<HomeSelector />} />
                        <Route path="/ricordi" element={<MemorySelector />} />
                        <Route path="/ricordo/:id" element={<DetailMemorySelector />} />
                        <Route path="/galleria" element={<GallerySelector />} />
                        <Route path="/idee" element={<Ideas />} />
                        <Route path="/mappa" element={<MappaSelector />} />
                        <Route path="/recap" element={<Recap />} />
                        <Route path="/profilo" element={<ProfileSelector />} />
                        <Route path="/logout" element={<div>Logout...</div>} />
                        <Route path="/upload" element={<UploadMobile />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/welcome" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </SidebarProvider>
        </UploadProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;


