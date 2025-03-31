import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  // Se stiamo ancora caricando, mostriamo il loading
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500" />
      </div>
    );
  }

  // Se non siamo autenticati e non stiamo più caricando, reindirizziamo
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 