/**
 * API Client Configuration
 * 
 * Configuration centralisée pour Axios avec:
 * - Injection automatique du JWT
 * - Gestion du refresh token
 * - Intercepteurs d'erreur
 */

import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// Types pour les réponses standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Initialiser le client API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Intercepteur de requête
 * Injection automatique du JWT depuis le sessionStorage
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Intercepteur de réponse
 * Gestion de l'expiration du token et tentative de refresh automatique
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 (non authentifié) et pas déjà en tentative de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenter de rafraîchir le token
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true } // Le refresh token est dans un httpOnly cookie
        );

        // Stocker le nouveau token
        sessionStorage.setItem('access_token', data.access_token);

        // Mettre à jour l'en-tête Authorization
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }

        // Relancer la requête originale avec le nouveau token
        return api(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué, nettoyer et rediriger vers la connexion
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export type { ApiResponse };
