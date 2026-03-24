import axios from 'axios';
import { getToken } from './storage';

const API_BASE_URL = 'http://localhost:8000/api'; // Kong Gateway

const api = axios.create({
  baseURL: API_BASE_URL,
  header: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
