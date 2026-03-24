import { create } from 'zustand';
import { saveToken, deleteToken } from '../utils/storage';

import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create((set) => ({
  user: null,
  employee: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  
  setEmployee: (employee) => set({ employee }),

  setAuth: async (user, token) => {
    if (token && user) {
      await saveToken('jwt_token', token);
      set({ user, token, isAuthenticated: true, error: null });
    } else {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data.data;
      const decoded = jwtDecode(access_token);
      
      const user = {
        id: decoded.sub,
        role: decoded.role,
        company_id: decoded.company_id,
      };

      await saveToken('jwt_token', access_token);
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur de connexion', isLoading: false });
      return false;
    }
  },
  
  logout: async () => {
    await deleteToken('jwt_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
