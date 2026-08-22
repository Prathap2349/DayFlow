// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading splash while restoring session from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M9 16C9 12.134 12.134 9 16 9s7 3.134 7 7-3.134 7-7 7"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="2.5" fill="white" />
            </svg>
          </div>
          <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access: redirect to own dashboard if wrong role
  if (requiredRole) {
    const isUserHrAdmin = user?.role === 'admin' || user?.role === 'hr';
    const isRequiredHrAdmin = requiredRole === 'admin' || requiredRole === 'hr';

    // If route requires HR/Admin but user is Employee
    if (isRequiredHrAdmin && !isUserHrAdmin) {
      return <Navigate to="/employee/dashboard" replace />;
    }

    // If route requires Employee but user is HR/Admin (optional strictness, usually fine though)
    if (requiredRole === 'employee' && isUserHrAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
