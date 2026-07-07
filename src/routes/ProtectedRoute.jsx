import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/roles';
import { getDefaultRoute } from '../config/navigation';

export function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(user, roles)) {
    return <Navigate to={getDefaultRoute(user?.role)} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDefaultRoute(user?.role)} replace />;
  }

  return children;
}
