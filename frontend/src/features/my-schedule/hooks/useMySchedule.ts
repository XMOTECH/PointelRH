import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { scheduleApi } from '../api/schedule.api';

export function useMySchedule() {
  const { user } = useAuth();
  const employeeId = user?.employee_id;

  return useQuery({
    queryKey: ['my-schedule', employeeId],
    queryFn: () => scheduleApi.getMySchedule(employeeId!),
    enabled: !!employeeId,
  });
}
