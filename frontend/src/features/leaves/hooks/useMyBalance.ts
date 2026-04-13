import { useQuery } from '@tanstack/react-query';
import { leavesApi } from '../api/leaves.api';

export function useMyBalance(year?: number) {
  return useQuery({
    queryKey: ['my-balance', year],
    queryFn: () => leavesApi.getMyBalance(year),
  });
}
