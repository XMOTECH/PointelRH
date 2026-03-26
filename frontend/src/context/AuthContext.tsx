import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import api from '../lib/axios';
import type { User } from '../types';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session au chargement (une seule fois)
  useEffect(() => {
    const restoreSession = async () => {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        try {
          // Vérifier le token auprès de l'API
          const response = await api.post('/api/auth/verify');
          const userData = response.data?.data?.user || response.data?.user || response.data;
          setUser(userData);
        } catch {
          sessionStorage.clear();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []); // Dépendance vide = une seule fois au montage

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    const responseData = response.data?.data || response.data;
    
    if (!responseData.access_token || !responseData.user) {
      throw new Error('Réponse API invalide');
    }

    sessionStorage.setItem('access_token', responseData.access_token);
    if (responseData.refresh_token) {
      sessionStorage.setItem('refresh_token', responseData.refresh_token);
    }
    
    setUser(responseData.user);
    return responseData.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await api.post('/api/auth/google', { id_token: idToken });
    const responseData = response.data?.data || response.data;

    if (!responseData.access_token || !responseData.user) {
      throw new Error('Réponse API invalide');
    }

    sessionStorage.setItem('access_token', responseData.access_token);
    if (responseData.refresh_token) {
      sessionStorage.setItem('refresh_token', responseData.refresh_token);
    }

    setUser(responseData.user);
    return responseData.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignorer les erreurs lors de la déconnexion
    } finally {
      sessionStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, loginWithGoogle, logout, loading }),
    [user, login, loginWithGoogle, logout, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

