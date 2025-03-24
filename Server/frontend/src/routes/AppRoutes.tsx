import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Lazy load pages
const Welcome = React.lazy(() => import('../pages/Welcome'));
const Home = React.lazy(() => import('../pages/Home'));
const Memories = React.lazy(() => import('../pages/Memories'));
const MemoryDetail = React.lazy(() => import('../pages/MemoryDetail'));
const Gallery = React.lazy(() => import('../pages/Gallery'));
const Ideas = React.lazy(() => import('../pages/Ideas'));
const IdeaDetail = React.lazy(() => import('../pages/IdeaDetail'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Recap = React.lazy(() => import('../pages/Recap'));

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div style={{ padding: 20, textAlign: 'center' }}>
          Caricamento...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ricordi"
          element={
            <ProtectedRoute>
              <Memories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ricordi/:id"
          element={
            <ProtectedRoute>
              <MemoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/galleria"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/idee"
          element={
            <ProtectedRoute>
              <Ideas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/idee/:id"
          element={
            <ProtectedRoute>
              <IdeaDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profilo"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/recap" 
          element={
            <ProtectedRoute>
              <Recap />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
