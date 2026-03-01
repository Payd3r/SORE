import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse['user'] | null;
  token: string | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
  setUser: (user: AuthResponse['user']) => void;
  updateUser: (user: AuthResponse['user']) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyTheme = (preference: 'light' | 'dark' | 'system') => {
    const el = document.documentElement;
    el.classList.remove('dark', 'light');
    if (preference === 'dark') {
      el.classList.add('dark');
    } else if (preference === 'light') {
      el.classList.add('light');
    } else {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        el.classList.add('dark');
      } else {
        el.classList.add('light');
      }
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser) as AuthResponse['user'];
        setToken(savedToken);
        setUser(parsed);
        setIsAuthenticated(true);
        applyTheme(parsed.theme_preference);
      } else {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.theme_preference) {
      applyTheme(user.theme_preference);
    }
  }, [user?.theme_preference]);

  // Impostiamo isLoading a false solo dopo il primo controllo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Piccolo delay per evitare flash di loading

    return () => clearTimeout(timer);
  }, []);

  const login = (response: AuthResponse) => {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    applyTheme(response.user.theme_preference);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('lastVisit');
    document.documentElement.classList.remove('dark', 'light');

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser: AuthResponse['user']) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token, 
      login, 
      logout, 
      setUser, 
      updateUser, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
}; 