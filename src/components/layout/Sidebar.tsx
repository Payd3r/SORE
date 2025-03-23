
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { 
  Home,
  BookMarked,
  ImageIcon,
  Lightbulb,
  Map,
  PieChart,
  LogOut,
  User,
  X
} from 'lucide-react';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Define the navigation items
  const navItems = [
    { name: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Ricordi', path: '/memories', icon: <BookMarked className="w-5 h-5" /> },
    { name: 'Galleria', path: '/gallery', icon: <ImageIcon className="w-5 h-5" /> },
    { name: 'Idee', path: '/ideas', icon: <Lightbulb className="w-5 h-5" /> },
    { name: 'Mappa', path: '/map', icon: <Map className="w-5 h-5" /> },
    { name: 'Recap', path: '/recap', icon: <PieChart className="w-5 h-5" /> },
  ];

  // Extract initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside 
      data-sidebar="true"
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-background border-r transition-transform duration-300 ease-in-out 
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Close button - only visible on mobile */}
        <button 
          className="md:hidden absolute top-4 right-4 p-1 rounded-full hover:bg-muted"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{user?.name}</h2>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
                }
              `}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setOpen(false);
                }
              }}
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <NavLink
              to="/profile"
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-colors flex-1
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
                }
              `}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setOpen(false);
                }
              }}
            >
              <User className="w-5 h-5" />
              <span className="ml-3 font-medium">Profilo</span>
            </NavLink>
            
            <ThemeToggle />
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};
