import api from '../../../lib/axios';

export const profileApi = {
  getMyProfile: () =>
    api.get('/api/employee/me').then(res => res.data?.data ?? res.data),
};
