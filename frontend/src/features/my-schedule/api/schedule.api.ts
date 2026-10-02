import api from '../../../lib/axios';

export const scheduleApi = {
  getMySchedule: (employeeId: string) =>
    api.get(`/api/employees/${employeeId}/schedule`).then(res => res.data?.data ?? res.data),

  getMyShifts: (date?: string) =>
    api.get('/api/planning/my-shifts', { params: { date } }).then(res => res.data?.data ?? res.data),
};
