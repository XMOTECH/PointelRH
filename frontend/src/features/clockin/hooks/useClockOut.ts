import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clockInApi } from '../api/clockin.api';
import type { ClockOutRequestPayload } from '../types';

export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClockOutRequestPayload) => {
      return clockInApi.clockOut(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['today-status'] });
    },
    onError: (error) => {
      console.error('Clock-out error:', error);
    },
  });
}
