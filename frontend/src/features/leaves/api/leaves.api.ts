import api from '../../../lib/axios';

// ── Types ────────────────────────────────────────────────

export interface LeaveType {
  id: string;
  name: string;
  max_days_per_year: number | null;
  requires_attachment: boolean;
  paid: boolean;
  color: string;
  is_active: boolean;
}

export interface LeaveBalance {
  id: string;
  leave_type_id: string;
  leave_type: LeaveType;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: LeaveType | string;
  leave_type_id?: string;
  start_date: string;
  end_date: string;
  reason: string;
  rejection_reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  approved_by?: string;
  approver?: { id: string; first_name: string; last_name: string };
  approved_at?: string;
  attachment_path?: string;
  half_day: boolean;
  half_day_period?: 'morning' | 'afternoon';
  days_count?: number;
  created_at: string;
  employee?: { id: string; first_name: string; last_name: string };
}

export interface CreateLeaveRequestDTO {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  half_day?: boolean;
  half_day_period?: 'morning' | 'afternoon';
}

// ── Helpers ──────────────────────────────────────────────

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

const unwrapOne = (res: any) => res.data?.data ?? res.data;

// ── API ──────────────────────────────────────────────────

export const leavesApi = {
  // Admin/Manager
  getLeaveRequests: (): Promise<LeaveRequest[]> =>
    api.get('/api/leaves').then(unwrap),

  updateStatus: (id: string, status: LeaveRequest['status'], rejection_reason?: string) =>
    api.patch(`/api/leaves/${id}/status`, { status, rejection_reason }).then(unwrapOne),

  // Employee self-service
  getMyLeaves: (): Promise<LeaveRequest[]> =>
    api.get('/api/employee/my-leaves').then(unwrap),

  getMyBalance: (year?: number): Promise<LeaveBalance[]> =>
    api.get('/api/employee/my-balance', { params: year ? { year } : undefined }).then(unwrap),

  createMyLeave: (data: CreateLeaveRequestDTO | FormData) => {
    const isFormData = data instanceof FormData;
    return api.post('/api/employee/my-leaves', data, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : undefined).then(unwrapOne);
  },

  cancelMyLeave: (id: string) =>
    api.delete(`/api/employee/my-leaves/${id}`).then(unwrapOne),

  // Leave types
  getLeaveTypes: (): Promise<LeaveType[]> =>
    api.get('/api/leave-types').then(unwrap),
};
