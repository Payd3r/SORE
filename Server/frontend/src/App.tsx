
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Add framer-motion dependency
import 'framer-motion/dist/framer-motion';

const App: React.FC = () => {
  // Add custom cursor effect
  useEffect(() => {
    if (window.innerWidth > 768) {
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
      
      const handleMouseMove = (e: MouseEvent) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (cursor.parentNode) {
          document.body.removeChild(cursor);
        }
      };
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CssBaseline />
          
          {/* Blob background decorations */}
          <div className="blob-bg">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
          </div>
          
          <AnimatePresence mode="wait">
            <Layout>
              <AppRoutes />
            </Layout>
          </AnimatePresence>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              },
              success: {
                style: {
                  background: '#10B981',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#EF4444',
                },
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
