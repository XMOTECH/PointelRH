import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // In dev, Vite proxy handles /api → Kong
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor requete — injecter le JWT automatiquement
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('access_token');
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

    // 401 + pas deja en retry → tenter le refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
          {},
          { withCredentials: true } // refresh token dans httpOnly cookie
        );
        sessionStorage.setItem('access_token', data.access_token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return api(originalRequest); // rejouer la requete originale
      } catch (refreshError) {
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
