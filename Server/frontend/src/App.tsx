import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CssBaseline />
          <Layout>
            <AppRoutes />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
