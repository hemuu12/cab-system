import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoadingScreen from './LoadingScreen.jsx';

export default function ProtectedRoute({ children, admin = false }) {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen message="Restoring your secure session…" detail="Keeping your journeys protected." />;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/account" replace />;
  return children;
}
