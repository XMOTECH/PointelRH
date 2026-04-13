import { useQuery } from '@tanstack/react-query';
import { leavesApi } from '../api/leaves.api';

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: leavesApi.getLeaveTypes,
  });
}
