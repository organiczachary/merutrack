import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'trainer' | 'supervisor')[];
  requiresAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiresAuth = true,
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center auth-background">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (requiresAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center auth-background">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};