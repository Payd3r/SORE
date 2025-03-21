
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, BookMarked, Image, Lightbulb, 
  MapPin, BarChart3, LogOut, User, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    }
  }, [location.pathname, isMobile, open, setOpen]);

  if (!user) return null;

  const navItems = [
    { to: '/home', icon: <Home size={20} />, label: 'Home' },
    { to: '/memories', icon: <BookMarked size={20} />, label: 'Ricordi' },
    { to: '/gallery', icon: <Image size={20} />, label: 'Galleria' },
    { to: '/ideas', icon: <Lightbulb size={20} />, label: 'Idee' },
    { to: '/map', icon: <MapPin size={20} />, label: 'Mappa' },
    { to: '/recap', icon: <BarChart3 size={20} />, label: 'Recap' },
  ];

  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform duration-300 ease-in-out 
    border-r border-sidebar-border flex flex-col h-full
    ${open ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}
    ${isMobile ? 'shadow-xl' : ''}
  `;

  const overlayClass = `
    fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300
    ${open && isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  const mainContentClass = `
    ml-0 md:ml-64 transition-all duration-300
    ${!isMobile && !open ? 'md:ml-0' : ''}
  `;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button 
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-primary-foreground shadow-md"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          type="button"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      
      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={overlayClass}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div className={sidebarClass}>
        <div className="flex items-center justify-center p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Ricordi
          </h1>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 p-4 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 text-sm font-medium rounded-md 
                    transition-colors duration-200 group
                    ${isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                  onClick={() => isMobile && setOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center justify-between mb-2">
            <NavLink 
              to="/settings" 
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
              onClick={() => isMobile && setOpen(false)}
            >
              <Settings size={20} className="mr-3" />
              <span>Impostazioni</span>
            </NavLink>
            <ThemeToggle />
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" />
            <span>Disconnetti</span>
          </Button>
        </div>
      </div>
    </>
  );
};
