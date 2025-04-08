import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../api/images';
import { useUpload } from '../contexts/UploadContext';
import {
  HomeIcon,
  BookOpenIcon,
  PhotoIcon,
  LightBulbIcon,
  MapIcon,
  ClockIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasActiveUploads, setShowUploadStatus } = useUpload();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? savedTheme === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
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
        <div className="p-5 sm:p-4 border-b border-gray-200 dark:border-gray-800 mt-14 sm:mt-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 py-2 px-3 rounded-xl transition-all duration-300 hover:shadow-md">
              <div className="relative">
                {user?.profile_picture_url ? (
                  <div className="relative h-16 w-16 sm:h-14 sm:w-14">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 dark:from-blue-500 dark:to-purple-700 rounded-full blur-md opacity-70 scale-90 animate-pulse-slow -z-10"></div>
                    <img
                      className="relative h-full w-full rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-lg"
                      src={getImageUrl(user.profile_picture_url)}
                      alt={user.name}
                    />
                  </div>
                ) : (
                  <div className="relative h-16 w-16 sm:h-14 sm:w-14">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 dark:from-blue-500 dark:to-purple-700 rounded-full blur-md opacity-70 scale-90 animate-pulse-slow"></div>
                    <div className="relative h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-xl font-bold shadow-md border-2 border-white dark:border-gray-800">
                      {user?.name?.[0] || 'U'}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              
              <div className="flex flex-col items-center sm:items-start mt-1 sm:mt-0 sm:ml-1 flex-1">
                <span className="text-gray-900 dark:text-white font-semibold text-lg sm:text-base tracking-wide">
                  {user?.name || 'Utente'}
                </span>
                
                <Link
                  to="/profilo"
                  className="mt-2 sm:mt-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  Visualizza profilo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu principale */}
      <nav className="flex-1 p-6 sm:p-4 pb-0 sm:pb-4">
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

      {/* Spazio flessibile che spinge il contenuto verso il basso */}
      <div className="flex-1"></div>

      {/* Footer con profilo e tema */}
      {hasActiveUploads && (
        <div className="px-6 sm:px-4 pb-4">
          <button
            onClick={() => {
              setShowUploadStatus(true);
              if (onClose) onClose();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-base w-full text-green-600 bg-green-50 dark:bg-green-900/40 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Upload in corso</span>
            <span className="flex h-3 w-3 ml-auto">
              <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </button>
        </div>
      )}

      <div className="p-6 sm:p-4 border-t border-gray-200 dark:border-gray-800 pb-safe-bottom mb-3 sm:mb-0">
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