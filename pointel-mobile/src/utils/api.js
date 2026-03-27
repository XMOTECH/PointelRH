import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, saveToken } from './storage';

let API_BASE_URL = '';

/**
 * Detects the best API base URL for the current environment.
 *
 * In dev on Android emulator with WSL2 backend, 10.0.2.2 won't work
 * because Docker runs inside WSL2, not on Windows host directly.
 * We extract the dev server host from the Expo bundle source URL
 * (which the emulator CAN reach), then point API calls to that same
 * host on port 8000 where Kong listens.
 */
const getDefaultBaseURL = () => {
  if (!__DEV__) return 'https://api.pointel.com/api';

  let host = null;

  // Strategy 1: Get host from Expo's sourceUrl (most reliable for emulators)
  try {
    const stack = new Error().stack;
    const matches = stack?.match(/http:\/\/([\d.]+):/g);
    if (matches) {
      for (const m of matches) {
        const ip = m.match(/http:\/\/([\d.]+):/)[1];
        if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
          host = ip;
          console.log('[API] Host detected from stack:', host);
          break;
        }
      }
    }
  } catch {
    // ignore
  }

  // Strategy 2: Expo SDK 55+ global
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    try {
      const expoHost = globalThis?.__expo?.developer?.host;
      if (typeof expoHost === 'string') {
        host = expoHost.split(':')[0];
        console.log('[API] Host detected from Expo global:', host);
      }
    } catch {
      // ignore
    }
  }

  // Strategy 3: Fallback for Android emulator
  if ((!host || host === 'localhost' || host === '127.0.0.1') && Platform.OS === 'android') {
    host = '10.0.2.2';
    console.log('[API] Falling back to Android emulator bridge:', host);
  }

  if (!host) {
    host = 'localhost';
  }

  // SPECIAL WSL2 ADVICE: If we are on Android and nothing works, 
  // the user probably needs the WSL IP (e.g. 172.x.x.x)
  if (Platform.OS === 'android') {
    console.warn(
      '[API] CONNECTION TROUBLE? If you get Network Error, try manually setting the API URL to your WSL IP.\n' +
      'Example: http://172.26.32.102:8000/api'
    );
  }

  return `http://${host}:8000/api`;
};

export const initApi = async () => {
  const savedUrl = await getToken('custom_api_url');
  if (savedUrl) {
    console.log('[API] Found saved custom URL:', savedUrl);
    // If it's a real custom URL (not a previous default), use it
    if (!savedUrl.includes('10.0.2.2') && !savedUrl.includes('localhost')) {
      API_BASE_URL = savedUrl;
    }
  }

  if (!API_BASE_URL) {
    API_BASE_URL = getDefaultBaseURL();
  }
  
  api.defaults.baseURL = API_BASE_URL;
  console.log('[API] Final BaseURL:', API_BASE_URL);
  return API_BASE_URL;
};

export const setManualBaseURL = async (url) => {
  API_BASE_URL = url;
  api.defaults.baseURL = url;
  await saveToken('custom_api_url', url);
  console.log('[API] Manual override:', url);
};

export const clearSavedUrl = async () => {
  await saveToken('custom_api_url', '');
};

export const getApiUrl = () => API_BASE_URL;

const api = axios.create({
  baseURL: getDefaultBaseURL(),
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

// Request interceptor — inject JWT
api.interceptors.request.use(async (config) => {
  const token = await getToken('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor — error logging
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error('[API] Network Error Details:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
