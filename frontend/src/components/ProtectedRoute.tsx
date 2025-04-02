import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="w-16 h-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-200 dark:border-blue-900/30"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 dark:border-blue-400 border-t-transparent animate-spin"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Accesso in corso</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Verifica delle credenziali...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 