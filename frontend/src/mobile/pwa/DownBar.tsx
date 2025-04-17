import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInfo } from '../../api/profile';
import { useQuery } from '@tanstack/react-query';
import { getImageUrl } from '../../api/images';
import {
  IoHomeOutline,
  IoHome,
  IoImageOutline,
  IoImage,
  IoMapOutline,
  IoMap,
  IoAddCircleOutline,
  IoAddCircle
} from 'react-icons/io5';

// Definizione degli elementi di navigazione
const getNavItems = (userProfilePic: string | null, userName: string | null) => {
  const profileInitial = userName ? userName[0].toUpperCase() : 'U';
  
  // Componente per l'icona del profilo attiva
  const ProfileActiveIcon = () => (
    userProfilePic ? (
      <div className="w-7 h-7 rounded-full overflow-hidden  dark:border-[#0A84FF]">
        <img src={getImageUrl(userProfilePic)} alt="Profile" className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full overflow-hidden  dark:border-[#0A84FF] flex items-center justify-center bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium text-xs">
        {profileInitial}
      </div>
    )
  );
  
  // Componente per l'icona del profilo inattiva
  const ProfileInactiveIcon = () => (
    userProfilePic ? (
      <div className="w-6 h-6 rounded-full overflow-hidden dark:border-gray-600">
        <img src={getImageUrl(userProfilePic)} alt="Profile" className="w-full h-full object-cover opacity-70" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full overflow-hidden dark:border-gray-600 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-white font-medium text-xs">
        {profileInitial}
      </div>
    )
  );

  return [
    {
      name: 'Home',
      path: '/',
      activeIcon: <IoHome className="w-6 h-6" />,
      inactiveIcon: <IoHomeOutline className="w-6 h-6" />
    },
    {
      name: 'Galleria',
      path: '/galleria',
      activeIcon: <IoImage className="w-6 h-6" />,
      inactiveIcon: <IoImageOutline className="w-6 h-6" />
    },
    {
      name: 'Plus',
      path: '/upload',
      activeIcon: <IoAddCircle className="w-7 h-7" />,
      inactiveIcon: <IoAddCircleOutline className="w-7 h-7" />
    },
    {
      name: 'Mappa',
      path: '/mappa',
      activeIcon: <IoMap className="w-6 h-6" />,
      inactiveIcon: <IoMapOutline className="w-6 h-6" />
    },
    {
      name: 'Profilo',
      path: '/profilo',
      activeIcon: <ProfileActiveIcon />,
      inactiveIcon: <ProfileInactiveIcon />
    }
  ];
};

const DownBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  
  // Ottieni i dati dell'utente una sola volta, non a ogni cambio di tema
  const { data: userInfoData } = useQuery({
    queryKey: ['user-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return getUserInfo(parseInt(user.id));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });
  
  // Genera gli elementi della navbar usando le informazioni dell'utente
  const navItems = getNavItems(
    userInfoData?.profile_picture_url || null, 
    userInfoData?.name || user?.name || null
  );

  // Aggiunge padding al body per la barra inferiore
  useEffect(() => {
    document.body.classList.add('pb-[calc(2rem+env(safe-area-inset-bottom))]');

    return () => {
      document.body.classList.remove('pb-[calc(2rem+env(safe-area-inset-bottom))]');
    };
  }, []);
  
  // Ascolta i cambiamenti del tema
  useEffect(() => {
    // Controlla lo stato iniziale
    const updateThemeMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    // Esegui subito per impostare lo stato iniziale
    updateThemeMode();
    
    // Ascolta l'evento personalizzato per i cambiamenti del tema
    window.addEventListener('themeChange', updateThemeMode);
    
    // Ascolta anche gli eventi di storage che potrebbero indicare cambiamenti del tema
    window.addEventListener('storage', (e) => {
      if (e.key === 'darkMode' || e.key === 'theme') {
        updateThemeMode();
      }
    });
    
    // Ascolta i cambiamenti della preferenza di colore del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateThemeMode);
    
    return () => {
      window.removeEventListener('themeChange', updateThemeMode);
      window.removeEventListener('storage', updateThemeMode);
      mediaQuery.removeEventListener('change', updateThemeMode);
    };
  }, []);

  // Verifica se il percorso corrente corrisponde all'item di navigazione
  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  // Gestisce la navigazione per tutti gli elementi
  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Evita di rinavicare alla pagina attuale
    if (currentPath === path || (path === '/' && currentPath === '/')) {
      return;
    }
    
    // Fornisci un feedback visuale immediato prima di navigare
    const target = e.currentTarget as HTMLElement;
    
    // Aggiungi classe per feedback immediato
    target.classList.add('active-feedback');
    
    // Questo renderà la navigazione percettivamente più veloce
    // Programmando la navigazione effettiva dopo il feedback visivo
    requestAnimationFrame(() => {
      // Naviga verso la pagina selezionata
      navigate(path, { replace: false });
      
      // Rimuovi la classe dopo una breve animazione
      setTimeout(() => {
        target.classList.remove('active-feedback');
      }, 150);
    });
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] 
        ${isDarkMode 
          ? 'bg-gray-900 text-white border-t border-gray-800' 
          : 'bg-[#F2F2F7] text-black border-t border-gray-200'
        }`} 
      data-scrollable="true"
      data-theme={isDarkMode ? 'dark' : 'light'}
      style={{ willChange: 'transform', contain: 'layout style' }}
    >
      <div className="grid grid-cols-5 h-12 pt-1">
        {navItems.map((item) => (
          <div
            key={item.name}
            onClick={(e) => handleNavigation(item.path, e)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors py-2 touch-manipulation 
              ${isDarkMode ? 'dark-nav-item' : 'light-nav-item'}`}
            style={{ 
              willChange: 'transform, opacity', 
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              userSelect: 'none'
            }}
          >
            <div className="transition-all">
              {isActive(item.path) ? (
                <div className={isDarkMode ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>
                  {item.activeIcon}
                </div>
              ) : (
                <div className={isDarkMode ? 'text-[#98989D]' : 'text-[#8E8E93]'}>
                  {item.inactiveIcon}
                </div>
              )}
            </div>
            <span 
              className={`text-xs ${
                isActive(item.path)
                  ? isDarkMode ? 'text-[#0A84FF] font-medium' : 'text-[#007AFF] font-medium'
                  : isDarkMode ? 'text-[#98989D]' : 'text-[#8E8E93]'
              }`}
            >
            </span>
          </div>
        ))}
      </div>

      {/* Stile globale per il feedback visivo */}
      <style>
        {`
        .active-feedback {
          transform: scale(0.95);
          opacity: 0.8;
          transition: transform 0.1s ease-out, opacity 0.1s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default DownBar; 