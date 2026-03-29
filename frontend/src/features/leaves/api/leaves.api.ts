import api from '../../../lib/axios';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  created_at: string;
}

export const leavesApi = {
  getLeaveRequests: () =>
    api.get('/api/leaves').then(res => {
      const d = res.data.data || res.data;
      return Array.isArray(d) ? d : (d.data || []);
    }),

  updateStatus: (id: string, status: LeaveRequest['status'], admin_comment?: string) =>
    api.patch(`/api/leaves/${id}/status`, { status, admin_comment }).then(res => res.data?.data ?? res.data),
};
