import api from '../../../lib/axios';

export const dashboardApi = {
  getDashboard: async (date?: string, period = 'day') => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (period) params.append('period', period);
    const response = await api.get(`/api/analytics/dashboard?${params.toString()}`);
    // Le backend renvoie { success: true, data: { totals, health_status, ... } }
    return response.data?.data || response.data;
  },
  getPresenceTrend: async (period = '7d') => {
    const response = await api.get(`/api/analytics/presence?period=${period}`);
    return response.data?.data || response.data || [];
  },
  getAttendancesToday: async (date?: string, period = 'day') => {
    // pointage-service expose GET /api/pointage/attendances/today
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (period) params.append('period', period);
    const response = await api.get(`/api/pointage/attendances/today?${params.toString()}`);
    const data = response.data?.data || response.data || [];
    // S'assurer que c'est un array
    return Array.isArray(data) ? data : [];
  },
};
