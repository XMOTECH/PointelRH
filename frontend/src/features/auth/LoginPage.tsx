import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { EmployeeLogin } from './components/EmployeeLogin';
import { AdminLogin } from './components/AdminLogin';
import { ManagerLogin } from './components/ManagerLogin';
import { useState, useCallback } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await login(email, pass);
      if (user.role === 'super_admin') navigate('/admin/companies');
      else if (user.role === 'employee') navigate('/clock-in');
      else navigate('/dashboard');
    } catch (err) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } }).response?.data;
      const errorMsg = (typeof data?.message === 'string' ? data.message : null) || 
                       (data?.error && data.error !== 'Unauthorized' ? data.error : null) || 
                       'Identifiants invalides. Veuillez vérifier votre email et mot de passe.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useCallback(async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle(idToken);
      if (user.role === 'super_admin') navigate('/admin/companies');
      else if (user.role === 'employee') navigate('/clock-in');
      else navigate('/dashboard');
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error || 
                       (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Échec de la connexion Google.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [loginWithGoogle, navigate]);

  const path = location.pathname;

  if (path === '/login/admin') {
    return <AdminLogin onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isLoading={isLoading} error={error} />;
  }

  if (path === '/login/manager') {
    return <ManagerLogin onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isLoading={isLoading} error={error} />;
  }

  return <EmployeeLogin onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isLoading={isLoading} error={error} />;
}
