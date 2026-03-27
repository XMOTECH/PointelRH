import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboard(date?: string, period = 'day') {
  return useQuery({
    queryKey: ['dashboard', date, period],
    queryFn: () => dashboardApi.getDashboard(date, period),
    refetchInterval: (date || period !== 'day') ? false : 30_000, 
    staleTime: 20_000,
  });
}

export function usePresenceTrend(period = '7d') {
  return useQuery({
    queryKey: ['presence-trend', period],
    queryFn: () => dashboardApi.getPresenceTrend(period),
    staleTime: 300_000, // 5 min de cache
  });
}

export function useAttendancesToday(date?: string, period = 'day') {
  return useQuery({
    queryKey: ['attendances', 'today', date, period],
    queryFn: () => dashboardApi.getAttendancesToday(date, period),
    refetchInterval: (date || period !== 'day') ? false : 15_000,
  });
}
