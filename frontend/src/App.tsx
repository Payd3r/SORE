import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UploadProvider } from './contexts/UploadContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import ProtectedRoute from './desktop/components/Layout/ProtectedRoute';
import ScrollToTop from './desktop/components/Layout/ScrollToTop';
import { Suspense, lazy, useEffect } from 'react';
import Layout from './desktop/components/Layout/Layout';
import { SidebarProvider } from './desktop/components/Layout/Layout';
import Loader from './desktop/components/Layout/Loader';
import { useIsPwa } from './utils/isPwa';
import MappaMobile from './mobile/pages/MappaMobile';

// Lazy loading delle pagine
const WelcomeAuthenticate = lazy(() => import('./desktop/pages/WelcomeAuthenticate'));
const Home = lazy(() => import('./desktop/pages/Home'));
const HomeMobile = lazy(() => import('./mobile/pages/HomeMobile'));
const Profile = lazy(() => import('./desktop/pages/Profile'));
const ProfileMobile = lazy(() => import('./mobile/pages/ProfileMobile'));
const CouplesConnectionMobile = lazy(() => import('./mobile/pages/CouplesConnectionMobile'));
const PrivacySecurityMobile = lazy(() => import('./mobile/pages/PrivacySecurityMobile'));
const ShareSpaceMobile = lazy(() => import('./mobile/pages/ShareSpaceMobile'));
const HelpCenterMobile = lazy(() => import('./mobile/pages/HelpCenterMobile'));
const Gallery = lazy(() => import('./desktop/pages/Gallery'));
const GalleryMobile = lazy(() => import('./mobile/pages/GalleryMobile'));
const Memory = lazy(() => import('./desktop/pages/Memory'));
const DetailMemory = lazy(() => import('./desktop/pages/DetailMemory'));
const DetailMemoryMobile = lazy(() => import('./mobile/pages/DetailMemoryMobile'));
const Ideas = lazy(() => import('./desktop/pages/Ideas'));
const Recap = lazy(() => import('./desktop/pages/Recap'));
const Mappa = lazy(() => import('./desktop/pages/Mappa'));
const UploadMobile = lazy(() => import('./mobile/pages/UploadMobile'));

// Layout PWA
const PwaLayout = lazy(() => import('./mobile/pwa/PwaLayout'));

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

const ProfileSubpageSelector = ({ page }: { page: 'coppia' | 'privacy' | 'condivisione' | 'aiuto' }) => {
  const isPwa = useIsPwa();
  if (!isPwa) return <Navigate to="/profilo" replace />;
  switch (page) {
    case 'coppia':
      return <CouplesConnectionMobile />;
    case 'privacy':
      return <PrivacySecurityMobile />;
    case 'condivisione':
      return <ShareSpaceMobile />;
    case 'aiuto':
      return <HelpCenterMobile />;
    default:
      return <Navigate to="/profilo" replace />;
  }
};

// Layout Selector - sceglie quale layout utilizzare in base alla modalità
const LayoutSelector = () => {
  const isPwa = useIsPwa();
  return isPwa ? <PwaLayout /> : <Layout />;
};

function App() {
  const isPwa = useIsPwa();

  useEffect(() => {
    if (!isPwa) {
      const initApp = () => {
        const sidebarElement = document.querySelector('aside') as HTMLElement;
        if (sidebarElement) {
          sidebarElement.style.transform = 'translateX(-100%) translateZ(0)';
        }
      };
      initApp();
      setTimeout(initApp, 100);
    }

    return () => {
      document.documentElement.style.removeProperty('--vh');
      document.documentElement.style.removeProperty('--vw');
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
              <ScrollToTop />
              <div className="min-h-[100dvh] w-full overflow-hidden">
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
                        <Route path="/profilo/coppia" element={<ProfileSubpageSelector page="coppia" />} />
                        <Route path="/profilo/privacy" element={<ProfileSubpageSelector page="privacy" />} />
                        <Route path="/profilo/condivisione" element={<ProfileSubpageSelector page="condivisione" />} />
                        <Route path="/profilo/aiuto" element={<ProfileSubpageSelector page="aiuto" />} />
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


