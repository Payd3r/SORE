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
    <div className="flex h-screen w-screen bg-white dark:bg-gray-900">
      {/* Gradient globale */}
      <div className="fixed top-0 left-0 right-0 h-[100px] sm:h-[200px] bg-gradient-to-b from-blue-600/10 dark:from-blue-500/10 to-transparent pointer-events-none z-0" />
      
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 inset-y-0 left-0 z-20 transform transition-transform duration-300 ease-in-out w-70 shrink-0 h-screen overflow-y-auto
        scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 
        dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main content wrapper with conditional blur */}
      <div className="flex-1 w-full lg:pl-0 overflow-y-auto relative
        scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 
        dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600
        ${isSidebarOpen ? 'blur-sm brightness-50' : ''}">
        {/* Top blur effect - visible only on mobile */}
        <div className="fixed top-0 left-0 right-0 h-24 lg:hidden pointer-events-none z-[1]" 
             style={{
               background: 'linear-gradient(to bottom, rgba(255,255,255,0.001) 0%, rgba(255,255,255,0.001) 100%)',
               backdropFilter: 'blur(100px)',
               maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
             }}
        />
        {/* Main content */}
        <main className="w-full min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Sidebar mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Hamburger button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed bottom-6 left-6 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 
        transition-all duration-200 lg:hidden z-30 outline-none focus:outline-none active:outline-none
        ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Apri menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={null}>
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


