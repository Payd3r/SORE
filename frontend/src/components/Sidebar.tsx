import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../api/images';
import {
  HomeIcon,
  BookOpenIcon,
  PhotoIcon,
  LightBulbIcon,
  MapIcon,
  ClockIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    // Controlla se c'è una preferenza salvata
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? savedTheme === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Applica il tema all'avvio
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen w-72 sm:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header con profilo */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-white dark:bg-gray-900"></div>
        <div className="p-6 sm:p-4 border-b border-gray-200 dark:border-gray-800 mt-14 sm:mt-4">
          <div className="flex items-center gap-4">
            {user?.profile_picture_url ? (
              <img
                className="h-8 w-8 rounded-full"
                src={getImageUrl(user.profile_picture_url)}
                alt={user.name}
              />
            ) : (
              <div className="w-14 h-14 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-xl font-semibold shadow-md ring-4 ring-blue-100 dark:ring-blue-900/50">
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <span className="text-gray-900 dark:text-white font-semibold text-xl sm:text-lg tracking-wide">
              {user?.name || 'Utente'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu principale */}
      <nav className="flex-1 p-6 sm:p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base ${isActive('/')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/ricordi"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base ${isActive('/ricordi')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <BookOpenIcon className="w-5 h-5" />
              <span>Ricordi</span>
            </Link>
          </li>
          <li>
            <Link
              to="/galleria"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base ${isActive('/galleria')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <PhotoIcon className="w-5 h-5" />
              <span>Galleria</span>
            </Link>
          </li>
          <li>
            <Link
              to="/idee"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base ${isActive('/idee')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <LightBulbIcon className="w-5 h-5" />
              <span>Idee</span>
            </Link>
          </li>
          <li>
            <Link
              to="/mappa"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base ${isActive('/mappa')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <MapIcon className="w-5 h-5" />
              <span>Mappa</span>
            </Link>
          </li>
          <li>
            <Link
              to="/recap"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base ${isActive('/recap')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <ClockIcon className="w-5 h-5" />
              <span>Recap</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer con profilo e tema */}
      <div className="p-6 sm:p-4 border-t border-gray-200 dark:border-gray-800 pb-safe-bottom">
        <Link
          to="/profilo"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full mb-2 text-base ${isActive('/profilo')
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <UserCircleIcon className="w-5 h-5" />
          <span>Profilo</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleLogout();
              onClose?.();
            }}
            className="flex-1 flex items-center gap-3 px-4 py-2.5 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg bg-transparent outline-none focus:outline-none active:outline-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Logout</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg bg-transparent outline-none focus:outline-none active:outline-none"
            aria-label={darkMode ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 