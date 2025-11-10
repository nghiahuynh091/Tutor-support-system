import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import type { UserRole } from '@/contexts/AuthContext'; 

interface ProtectedRouteProps {
  allowedRoles: UserRole[]; 
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth(); 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user ? user.role : (localStorage.getItem('currentRole') as UserRole);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}