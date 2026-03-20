import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Attendre le chargement

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (roles && !roles.includes(user.role)) {
      navigate('/', { replace: true });
      return;
    }
  }, [user, loading, roles, navigate]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Chargement...</div>;

  if (!user || (roles && !roles.includes(user.role))) {
    return null; // Les navigations sont gérées par useEffect
  }

  return <>{children}</>;
}
