import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useIsPwa } from '../../../utils/isPwa';
import Loader from './Loader';
import PwaLoadingScreen from '../../../mobile/components/ui/PwaLoadingScreen';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isPwa = useIsPwa();

  if (isLoading) {
    return isPwa ? (
      <PwaLoadingScreen
        text="Caricamento..."
        subText="Stiamo preparando la tua esperienza."
      />
    ) : (
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