import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboard(date?: string, period = 'day') {
  return useQuery({
    queryKey: ['dashboard', date, period],
    queryFn: () => dashboardApi.getDashboard(date, period),
    refetchInterval: (date || period !== 'day') ? false : 10_000, 
    staleTime: 2_000,
  });
}

export function usePresenceTrend(period = '7d') {
  return useQuery({
    queryKey: ['presence-trend', period],
    queryFn: () => dashboardApi.getPresenceTrend(period),
    refetchInterval: 15_000,
    staleTime: 2_000,
  });
}

export function useAttendancesToday(date?: string, period = 'day') {
  return useQuery({
    queryKey: ['attendances', 'today', date, period],
    queryFn: () => dashboardApi.getAttendancesToday(date, period),
    refetchInterval: (date || period !== 'day') ? false : 10_000,
    staleTime: 2_000,
  });
}
