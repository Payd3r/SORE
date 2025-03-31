import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { Suspense, lazy } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';

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

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-gray-900 overflow-hidden relative">
      {/* Sidebar mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>

      {/* Hamburger button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed bottom-4 left-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 
        transition-all duration-200 lg:hidden z-50 outline-none focus:outline-none active:outline-none
        ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Apri menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
    </div>
  );
};

// Componente di caricamento
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Rotta pubblica per la pagina di benvenuto */}
            <Route path="/welcome" element={<WelcomeAuthenticate />} />

            {/* Rotte protette */}
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

            {/* Redirect di default alla pagina di benvenuto */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;


