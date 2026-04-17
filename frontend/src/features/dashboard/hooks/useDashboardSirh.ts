import { useQuery } from '@tanstack/react-query';
import { leavesApi } from '../../leaves/api/leaves.api';
import { tasksApi } from '../../tasks/api/tasks.api';
import { missionsApi } from '../../missions/api/missions.api';
import { notificationsApi } from '../../notifications/api/notifications.api';

export function useDashboardSirh() {
  const today = new Date().toISOString().split('T')[0];

  const leaves = useQuery({
    queryKey: ['dashboard-leaves'],
    queryFn: () => leavesApi.getLeaveRequests(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const tasks = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => tasksApi.getTasks().then(res => res.data?.data ?? res.data ?? []),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const missions = useQuery({
    queryKey: ['dashboard-missions'],
    queryFn: () => missionsApi.getMissions().then(res => res.data?.data ?? res.data ?? []),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const notifications = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const leavesList = leaves.data ?? [];
  const tasksList = Array.isArray(tasks.data) ? tasks.data : [];
  const missionsList = Array.isArray(missions.data) ? missions.data : [];
  const notifsList = Array.isArray(notifications.data) ? notifications.data : [];

  const pendingLeaves = leavesList.filter(l => l.status === 'pending');
  const onLeaveToday = leavesList.filter(l =>
    l.status === 'approved' && l.start_date <= today && l.end_date >= today
  );
  const activeMissions = missionsList.filter((m: any) => m.status === 'active');
  const overdueTasks = tasksList.filter((t: any) =>
    t.due_date && t.due_date < today && t.status !== 'done'
  );
  const unreadNotifications = notifsList.filter((n: any) => !n.is_read);

  return {
    pendingLeaves,
    pendingLeavesCount: pendingLeaves.length,
    onLeaveToday,
    onLeaveTodayCount: onLeaveToday.length,
    activeMissions,
    activeMissionsCount: activeMissions.length,
    overdueTasks,
    overdueTasksCount: overdueTasks.length,
    unreadNotificationsCount: unreadNotifications.length,
    loading: leaves.isLoading || tasks.isLoading || missions.isLoading || notifications.isLoading,
  };
}
