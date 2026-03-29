import api from '../../../lib/axios';

export const settingsApi = {
  getSettings: () =>
    api.get('/api/settings').then(res => res.data?.data ?? res.data),

  getGroupSettings: (group: string) =>
    api.get(`/api/settings/${group}`).then(res => res.data?.data ?? res.data),

  updateSettings: (settings: Record<string, any>, group?: string) =>
    api.post('/api/settings', { settings, group }).then(res => res.data?.data ?? res.data),
};
