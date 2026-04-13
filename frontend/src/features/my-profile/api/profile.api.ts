import api from '../../../lib/axios';

export const profileApi = {
  getMyProfile: () =>
    api.get('/api/employee/me').then(res => res.data?.data ?? res.data),

  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) =>
    api.post('/api/auth/change-password', data),
};
