import { useQuery } from '@tanstack/react-query';
import { leavesApi } from '../api/leaves.api';

export function useMyLeaves() {
  return useQuery({
    queryKey: ['my-leaves'],
    queryFn: leavesApi.getMyLeaves,
  });
}
