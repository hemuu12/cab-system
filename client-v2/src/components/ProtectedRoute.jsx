import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function ProtectedRoute({ children, admin = false }) {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-shell loading"><span/><p>Restoring your secure session…</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/account" replace />;
  return children;
}
