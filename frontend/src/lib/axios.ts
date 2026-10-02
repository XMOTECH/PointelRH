import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // In dev, Vite proxy handles /api → Kong
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor requete — injecter le JWT automatiquement
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`; // No line breaks before Bearer
  }
  return config;
});

// Interceptor reponse — gerer l'expiration du token
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 ou 403 (Keycloak) + pas deja en retry + pas une route d'auth → tenter le refresh
    const isAuthRoute = originalRequest.url?.includes('/api/auth/login') || 
                        originalRequest.url?.includes('/api/auth/refresh');

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('Aucun refresh token disponible');
        }
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
          { refresh_token: refreshToken }
        );
        const newAccessToken = data?.data?.access_token || data?.access_token;
        const newRefreshToken = data?.data?.refresh_token || data?.refresh_token;

        if (newAccessToken) {
          sessionStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('access_token', newAccessToken);
        }
        if (newRefreshToken) {
          sessionStorage.setItem('refresh_token', newRefreshToken);
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        if (originalRequest.headers && newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
