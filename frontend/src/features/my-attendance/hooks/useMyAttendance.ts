import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '../api/attendance.api';

export function useMyAttendance() {
  const { user } = useAuth();
  const employeeId = user?.employee_id;

  return useQuery({
    queryKey: ['my-attendance', employeeId],
    queryFn: () => attendanceApi.getMyAttendance(employeeId!),
    enabled: !!employeeId,
  });
}
