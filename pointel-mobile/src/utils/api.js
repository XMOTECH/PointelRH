import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, saveToken } from './storage';

let API_BASE_URL = '';

// In development, handle different platform network behaviors automatically
const getDefaultBaseURL = () => {
  if (!__DEV__) return 'https://api.pointel.com/api'; // Production URL
  
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
  const host = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  
  if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
    return 'http://10.0.2.2:8000/api';
  }
  
  return `http://${host}:8000/api`;
};

// Initialize URL
export const initApi = async () => {
  const savedUrl = await getToken('custom_api_url');
  API_BASE_URL = savedUrl || getDefaultBaseURL();
  api.defaults.baseURL = API_BASE_URL;
  console.log('[API] Initialized with:', API_BASE_URL);
  return API_BASE_URL;
};

export const setManualBaseURL = async (url) => {
  API_BASE_URL = url;
  api.defaults.baseURL = url;
  await saveToken('custom_api_url', url);
  console.log('[API] Override Base URL:', url);
};

export const getApiUrl = () => API_BASE_URL;

const api = axios.create({
  baseURL: getDefaultBaseURL(), // Temporary until initApi is called
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Auth)
api.interceptors.request.use(async (config) => {
  const token = await getToken('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Resilience Interceptor (Error Handling only)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log network errors to help debug
    if (!error.response) {
      console.error('API Network Error:', error.message, 'Check if backend is reachable at', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);

export default api;
