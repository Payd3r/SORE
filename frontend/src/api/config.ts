// In dev locale usa sempre localhost; in produzione usa VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3002'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002');
const STATIC_BASE_URL = API_BASE_URL;

export const API_URLS = {
  base: API_BASE_URL,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    registerJoin: `${API_BASE_URL}/api/auth/register/join`,
    registerNew: `${API_BASE_URL}/api/auth/register/new`,
  }
};

export const STATIC_URLS = {
  images: STATIC_BASE_URL,
};

import axios from 'axios';

// Crea un'istanza axios custom
const axiosInstance = axios.create();

// Interceptor di risposta per gestire il 403 (token scaduto)
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      // Logout globale e redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('darkMode');
      localStorage.removeItem('lastVisit');
      window.location.href = '/welcome';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 