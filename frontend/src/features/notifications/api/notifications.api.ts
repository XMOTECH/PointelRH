import api from '../../../lib/axios';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  link?: string;
}

export const notificationsApi = {
  getNotifications: () =>
    api.get('/api/notifications').then(res => {
      const d = res.data.data || res.data;
      return Array.isArray(d) ? d : (d.data || []);
    }),

  markAsRead: (id: string) =>
    api.post(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    api.post('/api/notifications/read-all'),

  deleteNotification: (id: string) =>
    api.delete(`/api/notifications/${id}`),
};
