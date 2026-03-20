import { create } from 'zustand';
import { saveToken, deleteToken } from '../utils/storage';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  
  setAuth: async (user, token) => {
    if (token) await saveToken('jwt_token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    await deleteToken('jwt_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
