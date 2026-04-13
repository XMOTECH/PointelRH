import api from '../../../lib/axios';
import type { Schedule } from '../../employees/types';

export const schedulesApi = {
  getSchedules: () =>
    api.get('/api/schedules').then(res => {
      const d = res.data.data || res.data;
      return Array.isArray(d) ? d : (d.data || []);
    }),

  getSchedule: (id: string): Promise<Schedule> =>
    api.get(`/api/schedules/${id}`).then(res => res.data?.data ?? res.data),

  createSchedule: (data: Partial<Schedule>): Promise<Schedule> =>
    api.post('/api/schedules', data).then(res => res.data?.data ?? res.data),

  updateSchedule: (id: string, data: Partial<Schedule>): Promise<Schedule> =>
    api.patch(`/api/schedules/${id}`, data).then(res => res.data?.data ?? res.data),

  deleteSchedule: (id: string): Promise<void> =>
    api.delete(`/api/schedules/${id}`).then(() => undefined),

  assignScheduleToEmployee: (employeeId: string, scheduleId: string | null) =>
    api.patch(`/api/employees/${employeeId}`, { schedule_id: scheduleId }).then(res => res.data?.data ?? res.data),

  getPlanning: (params: { start_date: string; end_date: string; department_id?: string }) =>
    api.get('/api/planning', { params }).then(res => res.data?.data ?? res.data),

  getTimeline: (params: { start?: string; end?: string; department_id?: string }) =>
    api.get('/api/timeline/team', { params }).then(res => res.data?.data ?? res.data),

  getOccupancy: (params: { date?: string; department_id?: string }) =>
    api.get('/api/timeline/occupancy', { params }).then(res => res.data?.data ?? res.data),

  saveOverride: (data: { employee_id: string; date: string; is_off: boolean; start_time?: string; end_time?: string; reason?: string }) =>
    api.post('/api/planning/override', data).then(res => res.data?.data ?? res.data),
};
