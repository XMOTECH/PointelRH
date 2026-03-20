import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session au chargement
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      // Verifier le token aupres de l'API Gateway
      api.post('/api/auth/verify')
        .then(({ data }) => setUser(data))
        .catch(() => sessionStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    sessionStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore errors during logout
    } finally {
      sessionStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
        {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre dans AuthProvider');
  return ctx;
};
