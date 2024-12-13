import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user has valid license from localStorage or context
  const hasValidLicense = localStorage.getItem('caldump_license');

  if (!hasValidLicense) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;