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

  useEffect(() => {
    const checkAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
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

    // Applica il tema preferito dell'utente
    if (response.user.theme_preference === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (response.user.theme_preference === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (response.user.theme_preference === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const logout = () => {
    // Rimuovi tutti i dati di autenticazione
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rimuovi eventuali altri dati salvati
    localStorage.removeItem('darkMode');
    localStorage.removeItem('lastVisit');
    
    // Pulisci lo stato
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Forza il refresh della pagina per pulire tutti gli stati
    window.location.href = '/welcome';
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