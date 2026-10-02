/**
 * Hook: usePunch
 * Gère le pointage unifié intelligent (Smart Toggle) avec React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clockInApi } from '../api/clockin.api';
import type { PunchRequestPayload, PunchResponse } from '../types';

export function usePunch() {
  const queryClient = useQueryClient();

  return useMutation<PunchResponse, Error, PunchRequestPayload>({
    mutationFn: (payload: PunchRequestPayload) => clockInApi.punch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['today-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
    },
    onError: (error: any) => {
      console.error('Punch error:', error);
      queryClient.invalidateQueries({ queryKey: ['today-status'] });
    },
  });
}
