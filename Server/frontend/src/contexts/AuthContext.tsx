import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  coupleId: number;
  profilePicture?: string;
  themePreference?: 'light' | 'dark';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  registerWithExistingCouple: (name: string, email: string, password: string, coupleId: string) => Promise<void>;
  registerWithNewCouple: (name: string, email: string, password: string, coupleName: string, anniversaryDate: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.login(email, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore durante il login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithExistingCouple = async (name: string, email: string, password: string, coupleId: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.registerWithExistingCouple({ 
        name, 
        email, 
        password, 
        coupleId: parseInt(coupleId, 10) 
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore durante la registrazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithNewCouple = async (name: string, email: string, password: string, coupleName: string, anniversaryDate: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.registerWithNewCouple({ name, email, password, coupleName, anniversaryDate });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore durante la registrazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, registerWithExistingCouple, registerWithNewCouple, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
