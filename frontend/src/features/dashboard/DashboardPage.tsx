import { useDashboard, useAttendancesToday, usePresenceTrend } from './hooks/useDashboard';
import { useDashboardSirh } from './hooks/useDashboardSirh';
import { ExecutiveKpiCards } from './components/ExecutiveKpiCards';
import { QuickStats } from './components/QuickStats';
import { AttendanceChart } from './components/AttendanceChart';
import { WorkforceSplit } from './components/WorkforceSplit';
import { PendingActions } from './components/PendingActions';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const { data: rawDashboardData, isLoading: dashboardLoading } = useDashboard(selectedDate, period);
  const { data: rawAttendances, isLoading: attendancesLoading } = useAttendancesToday(selectedDate, period);
  const { data: rawPresenceTrend, isLoading: trendLoading } = usePresenceTrend(
    period === 'month' ? '30d' : '7d'
  );

  const sirh = useDashboardSirh();

  const dashboardData = rawDashboardData || {};
  const todayAttendances = Array.isArray(rawAttendances) ? rawAttendances : [];
  const presenceTrend = Array.isArray(rawPresenceTrend)
    ? rawPresenceTrend
    : (rawPresenceTrend as any)?.data || [];

  const totals = (dashboardData as { totals?: Record<string, number> })?.totals || {};
  const presentCount = todayAttendances.length;
  const totalEmployees = totals?.total_employees ?? 0;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;
  const lateCount = todayAttendances.filter((a: { status?: string }) =>
    String(a.status || '').toLowerCase() === 'late'
  ).length;

  const enrichedTotals = {
    ...totals,
    total_present: presentCount,
    attendance_rate: attendanceRate,
    total_late: lateCount,
  };

  const periodLabel = period === 'day'
    ? (selectedDate === new Date().toISOString().split('T')[0]
      ? "Activité d'aujourd'hui"
      : `Activité du ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`)
    : period === 'week'
      ? `Activité de la semaine du ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
      : `Activité du mois de ${new Date(selectedDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Tableau de Bord</h1>
          <p className="text-sm text-on-surface-variant/60 mt-0.5">{periodLabel}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/20">
            <Calendar className="text-primary" size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="bg-transparent border-none text-on-surface font-medium text-sm focus:ring-0 outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards (6) */}
      <ExecutiveKpiCards
        totals={enrichedTotals}
        pendingLeavesCount={sirh.pendingLeavesCount}
        overdueTasksCount={sirh.overdueTasksCount}
        loading={dashboardLoading || attendancesLoading}
        sirhLoading={sirh.loading}
      />

      {/* Quick Stats Bar */}
      <QuickStats
        activeMissionsCount={sirh.activeMissionsCount}
        onLeaveTodayCount={sirh.onLeaveTodayCount}
        unreadNotificationsCount={sirh.unreadNotificationsCount}
        loading={sirh.loading}
      />

      {/* Charts Row */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <AttendanceChart data={presenceTrend} loading={trendLoading} />
        <WorkforceSplit />
      </div>

      {/* Pending Actions (Tabs: Anomalies | Congés | Tâches) */}
      <PendingActions
        attendances={todayAttendances}
        attendancesLoading={attendancesLoading}
        pendingLeaves={sirh.pendingLeaves}
        overdueTasks={sirh.overdueTasks}
        sirhLoading={sirh.loading}
      />
    </motion.div>
  );
}
