import { useAuth as useAuthCtx } from '../../../context/AuthContext';

export function useAuth() {
  const { login, logout, user, loading } = useAuthCtx();

  return {
    login,
    logout,
    user,
    loading
  };
}
