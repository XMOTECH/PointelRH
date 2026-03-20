import api from '../../../lib/axios';

export const dashboardApi = {
  getDashboard: () => api.get('/api/analytics/dashboard').then(r => r.data),
  getPresenceTrend: (period = '7d') => api.get(`/api/analytics/presence?period=${period}`).then(r => r.data),
  getAttendancesToday: () => api.get('/api/attendances/today').then(r => r.data),
};
