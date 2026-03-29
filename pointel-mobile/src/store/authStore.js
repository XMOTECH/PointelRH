import { create } from 'zustand';
import { saveToken, deleteToken } from '../utils/storage';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create((set, get) => ({
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
      set({ user: null, employee: null, token: null, isAuthenticated: false });
    }
  },

  /**
   * Fetch employee profile from backend and store it.
   * Called after login or session restore.
   */
  fetchEmployee: async () => {
    const { user } = get();
    if (!user?.id) return null;
    try {
      const response = await api.get(`/employees/by-user/${user.id}`, {
        params: { email: user.email },
      });
      const employee = response.data?.data ?? response.data;
      set({ employee });
      return employee;
    } catch (err) {
      console.warn('[Auth] Failed to fetch employee:', err.message);
      return null;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const responseData = response.data?.data ?? response.data;
      const accessToken = responseData.access_token;
      const decoded = jwtDecode(accessToken);

      const user = {
        id: decoded.sub,
        role: decoded.role,
        company_id: decoded.company_id,
        name: responseData.user?.name,
        email: responseData.user?.email,
      };

      await saveToken('jwt_token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });

      // Fetch employee profile in background
      try {
        const empResponse = await api.get(`/employees/by-user/${user.id}`, {
          params: { email: user.email },
        });
        const employee = empResponse.data?.data ?? empResponse.data;
        set({ employee });
      } catch {
        // Non-blocking — profile screen will retry
      }

      return true;
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || 'Erreur de connexion';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await deleteToken('jwt_token');
    set({ user: null, employee: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
