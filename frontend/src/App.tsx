import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UploadProvider } from './contexts/UploadContext';
import { IsPwaProvider, useIsPwaContext } from './contexts/IsPwaContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient, setupPwaQueryPersistence } from './lib/react-query';
import ProtectedRoute from './desktop/components/Layout/ProtectedRoute';
import ScrollToTop from './desktop/components/Layout/ScrollToTop';
import { Suspense, lazy, useEffect, useMemo, useRef } from 'react';
import Layout from './desktop/components/Layout/Layout';
import { SidebarProvider } from './desktop/components/Layout/Layout';
import DesktopLoader from './desktop/components/Layout/Loader';
import PwaLoadingScreen from './mobile/components/ui/PwaLoadingScreen';
import MappaMobile from './mobile/pages/MappaMobile';


// Lazy loading delle pagine
const WelcomeAuthenticate = lazy(() => import('./desktop/pages/WelcomeAuthenticate'));
const WelcomeMobile = lazy(() => import('./mobile/pages/WelcomeMobile'));
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
const IdeasMobile = lazy(() => import('./mobile/pages/IdeasMobile'));
const Memory = lazy(() => import('./desktop/pages/Memory'));
const DetailMemory = lazy(() => import('./desktop/pages/DetailMemory'));
const DetailMemoryMobile = lazy(() => import('./mobile/pages/DetailMemoryMobile'));
const Ideas = lazy(() => import('./desktop/pages/Ideas'));
const Recap = lazy(() => import('./desktop/pages/Recap'));
const Mappa = lazy(() => import('./desktop/pages/Mappa'));
const UploadMobile = lazy(() => import('./mobile/pages/UploadMobile'));
const AddMobile = lazy(() => import('./mobile/pages/AddMobile'));
const SettingsMobile = lazy(() => import('./mobile/pages/SettingsMobile'));
const SharedMemoryPage = lazy(() => import('./pages/SharedMemoryPage'));

// Layout PWA
const PwaLayout = lazy(() => import('./mobile/pwa/PwaLayout'));

// Componente che sceglie quale versione della Home mostrare
const HomeSelector = () => {
  const isPwa = useIsPwaContext();
  return isPwa ? <HomeMobile /> : <Home />;
};

// Componente che sceglie quale versione della Galleria mostrare
const GallerySelector = () => {
  const isPwa = useIsPwaContext();
  return isPwa ? <GalleryMobile /> : <Gallery />;
};

const IdeasSelector = () => {
  const isPwa = useIsPwaContext();
  return isPwa ? <IdeasMobile /> : <Ideas />;
};

// Per altre pagine che potrebbero avere una versione mobile in futuro
const MappaSelector = () => {
  const isPwa = useIsPwaContext();
  return isPwa ? <MappaMobile /> : <Mappa />;
};

const MemorySelector = () => {
  return <Memory />;
};

const DetailMemorySelector = () => {
  const isPwa = useIsPwaContext();
  return isPwa ? <DetailMemoryMobile /> : <DetailMemory />;
};

const ProfileSelector = () => {
  const isPwa = useIsPwaContext();
  return isPwa ? <ProfileMobile /> : <Profile />;
};

const ProfileSubpageSelector = ({ page }: { page: 'coppia' | 'privacy' | 'condivisione' | 'aiuto' }) => {
  const isPwa = useIsPwaContext();
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
  const isPwa = useIsPwaContext();
  return isPwa ? <PwaLayout /> : <Layout />;
};

function AppInner() {
  const isPwa = useIsPwaContext();
  const persistenceCleanupRef = useRef<(() => void) | null>(null);
  const queryClient = useMemo(() => createAppQueryClient(isPwa), [isPwa]);

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

  useEffect(() => {
    persistenceCleanupRef.current?.();
    persistenceCleanupRef.current = setupPwaQueryPersistence(queryClient, isPwa);

    return () => {
      persistenceCleanupRef.current?.();
      persistenceCleanupRef.current = null;
    };
  }, [queryClient, isPwa]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UploadProvider>
          <SidebarProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-[100dvh] w-full overflow-hidden">
                <Suspense fallback={
                  isPwa ? (
                    <PwaLoadingScreen
                      text="Caricamento..."
                      subText="Stiamo preparando la tua esperienza."
                    />
                  ) : (
                    <DesktopLoader
                      type="spinner"
                      size="lg"
                      fullScreen
                      text="Caricamento in corso..."
                      subText="Stiamo preparando l'app per te"
                    />
                  )
                }>
                  <Routes>
                    <Route path="/welcome" element={isPwa ? <WelcomeMobile /> : <WelcomeAuthenticate />} />
                    <Route path="/condividi/:token" element={<SharedMemoryPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route element={<LayoutSelector />}>
                        <Route path="/" element={<HomeSelector />} />
                        <Route path="/ricordi" element={<MemorySelector />} />
                        <Route path="/ricordo/:id" element={<DetailMemorySelector />} />
                        <Route path="/galleria" element={<GallerySelector />} />
                        <Route path="/idee" element={<IdeasSelector />} />
                        <Route path="/mappa" element={<MappaSelector />} />
                        <Route path="/recap" element={<Recap />} />
                        <Route path="/profilo" element={<ProfileSelector />} />
                        <Route path="/profilo/coppia" element={<ProfileSubpageSelector page="coppia" />} />
                        <Route path="/profilo/privacy" element={<ProfileSubpageSelector page="privacy" />} />
                        <Route path="/profilo/condivisione" element={<ProfileSubpageSelector page="condivisione" />} />
                        <Route path="/profilo/aiuto" element={<ProfileSubpageSelector page="aiuto" />} />
                        <Route path="/impostazioni" element={isPwa ? <SettingsMobile /> : <Navigate to="/profilo" replace />} />
                        <Route path="/logout" element={<div>Logout...</div>} />
                        <Route path="/upload" element={<UploadMobile />} />
                        <Route path="/add" element={<AddMobile />} />
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

function App() {
  return (
    <IsPwaProvider>
      <AppInner />
    </IsPwaProvider>
  );
}

export default App;


