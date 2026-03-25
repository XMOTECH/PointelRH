import { useAuth as useAuthCtx } from '../../../context/AuthContext';

export function useAuth() {
  const { login, loginWithGoogle, logout, user, loading } = useAuthCtx();

  return {
    login,
    loginWithGoogle,
    logout,
    user,
    loading
  };
}
