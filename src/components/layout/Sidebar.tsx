
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  X, Home, BookMarked, Image, Lightbulb, 
  MapPin, BarChart3, LogOut, User, Settings,
  Heart
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
  const { user, couple, signOut } = useAuth();
  const { theme } = useTheme();
  
  if (!user) return null;

  const navItems = [
    { to: '/home', icon: <Home size={20} />, label: 'Home' },
    { to: '/memories', icon: <BookMarked size={20} />, label: 'Ricordi' },
    { to: '/gallery', icon: <Image size={20} />, label: 'Galleria' },
    { to: '/ideas', icon: <Lightbulb size={20} />, label: 'Idee' },
    { to: '/map', icon: <MapPin size={20} />, label: 'Mappa' },
    { to: '/recap', icon: <BarChart3 size={20} />, label: 'Recap' },
    { to: '/profile', icon: <User size={20} />, label: 'Profilo' },
  ];

  // Ensure that z-index values are properly set
  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 w-64 bg-background transition-transform duration-300 ease-in-out 
    border-r border-border flex flex-col h-full
    ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    ${isMobile && 'shadow-xl'}
  `;

  const overlayClass = `
    fixed inset-0 z-40 bg-black/50 transition-opacity duration-300
    ${open ? 'opacity-100 md:opacity-0 md:pointer-events-none' : 'opacity-0 pointer-events-none'}
  `;

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={overlayClass}
        onClick={() => setOpen(false)}
        data-testid="sidebar-overlay"
      />

      {/* Sidebar */}
      <div className={sidebarClass} data-testid="sidebar">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-500" />
            {couple ? couple.name : 'Ricordi'}
          </h1>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Chiudi menu"
            >
              <X size={20} />
            </Button>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 p-4 border-b border-border">
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
            <p className="text-sm font-medium truncate">
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
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-muted hover:text-foreground'}
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
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between mb-2">
            <NavLink 
              to="/profile" 
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
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
