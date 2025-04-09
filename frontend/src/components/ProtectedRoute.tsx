import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Loader 
        type="spinner" 
        size="lg" 
        fullScreen 
        text="Caricamento in corso..." 
        subText="Stiamo preparando l'app per te"
      />
    );
  }

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 