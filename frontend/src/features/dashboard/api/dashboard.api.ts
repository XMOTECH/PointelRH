import api from '../../../lib/axios';

export const dashboardApi = {
  getDashboard: async () => {
    const response = await api.get('/api/analytics/dashboard');
    return response.data?.data || response.data || [];
  },
  getPresenceTrend: async (period = '7d') => {
    const response = await api.get(`/api/analytics/presence?period=${period}`);
    return response.data?.data || response.data || [];
  },
  getAttendancesToday: async () => {
    // pointage-service expose GET /api/pointage/attendances/today
    const response = await api.get('/api/pointage/attendances/today');
    const data = response.data?.data || response.data || [];
    // S'assurer que c'est un array
    return Array.isArray(data) ? data : [];
  },
};
