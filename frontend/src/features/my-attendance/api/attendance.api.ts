import api from '../../../lib/axios';
import type { Attendance } from '../types';

export const attendanceApi = {
  getMyAttendance: (employeeId: string): Promise<Attendance[]> =>
    api.get(`/api/pointage/attendances/employee/${employeeId}`).then(res => {
      const d = res.data?.data ?? res.data;
      return Array.isArray(d) ? d : (d?.data || []);
    }),
};
