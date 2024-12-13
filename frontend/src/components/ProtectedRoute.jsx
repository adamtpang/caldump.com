import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasValidLicense } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!hasValidLicense) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;