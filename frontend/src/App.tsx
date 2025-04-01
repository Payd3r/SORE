import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import { Suspense, lazy, useEffect } from 'react';
import Layout from './components/Layout';

// Lazy loading delle pagine
const WelcomeAuthenticate = lazy(() => import('./pages/WelcomeAuthenticate'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Memory = lazy(() => import('./pages/Memory'));
const DetailMemory = lazy(() => import('./pages/DetailMemory'));
const Ideas = lazy(() => import('./pages/Ideas'));
const Recap = lazy(() => import('./pages/Recap'));
const Mappa = lazy(() => import('./pages/Mappa'));

function App() {
  useEffect(() => {
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
          'height=' + vh + ', minimal-ui, standalone=yes'
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
            <Suspense fallback={null}>
              <Routes>
                <Route path="/welcome" element={<WelcomeAuthenticate />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/ricordi" element={<Memory />} />
                    <Route path="/ricordo/:id" element={<DetailMemory />} />
                    <Route path="/galleria" element={<Gallery />} />
                    <Route path="/idee" element={<Ideas />} />
                    <Route path="/mappa" element={<Mappa />} />
                    <Route path="/recap" element={<Recap />} />
                    <Route path="/profilo" element={<Profile />} />
                    <Route path="/logout" element={<div>Logout...</div>} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/welcome" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;


