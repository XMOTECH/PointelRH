import api from '../../../lib/axios';
import type { Schedule } from '../../employees/types';
import type {
  PlanningWeekResponse,
  ShiftTemplate,
  CreateShiftPayload,
  DuplicateWeekPayload,
} from '../types';

export const schedulesApi = {
  // ── Modèles de plannings hebdomadaires classiques ──
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
    api.put(`/api/employees/${employeeId}`, { scheduleId: scheduleId, schedule_id: scheduleId }).then(res => res.data?.data ?? res.data),

  assignEmployeesToSchedule: (scheduleId: string, employeeIds: string[]) =>
    api.post(`/api/schedules/${scheduleId}/assign`, { employeeIds }).then(res => res.data?.data ?? res.data),

  // ── Moteur WFM : Matrice Semaine & Publication ──
  getWeekPlanning: (date: string, departmentId?: string): Promise<PlanningWeekResponse> =>
    api.get('/api/planning/week', { params: { date, department_id: departmentId } }).then(res => res.data?.data ?? res.data),

  publishWeek: (weekStart: string, departmentId?: string) =>
    api.post('/api/planning/week/publish', { weekStart, departmentId }).then(res => res.data?.data ?? res.data),

  duplicateWeek: (payload: DuplicateWeekPayload) =>
    api.post('/api/planning/week/duplicate', payload).then(res => res.data?.data ?? res.data),

  // ── Shifts individuels ──
  createShift: (payload: CreateShiftPayload) =>
    api.post('/api/shifts', payload).then(res => res.data),

  updateShift: (id: string, payload: Partial<CreateShiftPayload> & { status?: string }) =>
    api.patch(`/api/shifts/${id}`, payload).then(res => res.data),

  moveShift: (id: string, payload: { employeeId?: string | null; date?: string; startTime?: string; endTime?: string }) =>
    api.post(`/api/shifts/${id}/move`, payload).then(res => res.data),

  deleteShift: (id: string) =>
    api.delete(`/api/shifts/${id}`).then(res => res.data),

  // ── Modèles de Shifts Types (ShiftTemplate) ──
  getShiftTemplates: (departmentId?: string): Promise<ShiftTemplate[]> =>
    api.get('/api/shift-templates', { params: { department_id: departmentId } }).then(res => res.data?.data ?? res.data),

  createShiftTemplate: (payload: Partial<ShiftTemplate>) =>
    api.post('/api/shift-templates', payload).then(res => res.data?.data ?? res.data),

  updateShiftTemplate: (id: string, payload: Partial<ShiftTemplate>) =>
    api.patch(`/api/shift-templates/${id}`, payload).then(res => res.data?.data ?? res.data),

  deleteShiftTemplate: (id: string) =>
    api.delete(`/api/shift-templates/${id}`).then(res => res.data),

  // ── Rétro-compatibilité ──
  getPlanning: (params: { start_date: string; end_date: string; department_id?: string }) =>
    api.get('/api/planning/week', { params: { date: params.start_date, department_id: params.department_id } }).then(res => res.data?.data ?? res.data),

  getTimeline: (params: { start?: string; end?: string; department_id?: string }) =>
    api.get('/api/timeline/team', { params }).then(res => res.data?.data ?? res.data),

  getOccupancy: (params: { date?: string; department_id?: string }) =>
    api.get('/api/timeline/occupancy', { params }).then(res => res.data?.data ?? res.data),

  saveOverride: (data: { employee_id: string; date: string; is_off: boolean; start_time?: string; end_time?: string; reason?: string }) =>
    api.post('/api/planning/override', data).then(res => res.data?.data ?? res.data),
};
