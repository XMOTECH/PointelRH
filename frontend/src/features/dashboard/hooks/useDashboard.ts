import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
    refetchInterval: 30_000, // refresh toutes les 30 secondes
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

export function useAttendancesToday() {
  return useQuery({
    queryKey: ['attendances', 'today'],
    queryFn: dashboardApi.getAttendancesToday,
    refetchInterval: 15_000,
  });
}
