import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Loader 
        type="circle" 
        size="lg" 
        fullScreen 
        text="Accesso in corso"
        subText="Verifica delle credenziali..."
      />
    );
  }

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 