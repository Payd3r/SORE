
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-context';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full transition-all duration-300"
    >
      {theme === 'light' ? (
        <Sun size={20} className="transition-transform duration-300 rotate-0" />
      ) : (
        <Moon size={20} className="transition-transform duration-300 rotate-0" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Attiva tema scuro' : 'Attiva tema chiaro'}
      </span>
    </Button>
  );
};
