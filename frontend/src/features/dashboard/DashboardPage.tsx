import { useDashboard, useAttendancesToday, usePresenceTrend } from './hooks/useDashboard';
import { ExecutiveKpiCards } from './components/ExecutiveKpiCards';
import { AttendanceChart } from './components/AttendanceChart';
import { WorkforceSplit } from './components/WorkforceSplit';
import { RecentAttendanceFailures } from './components/RecentAttendanceFailures';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: rawDashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: rawAttendances, isLoading: attendancesLoading } = useAttendancesToday();
  const { data: rawPresenceTrend, isLoading: trendLoading } = usePresenceTrend('7d');

  // Data processing
  const dashboardData = (rawDashboardData as any)?.data || rawDashboardData || {};
  const todayAttendances = Array.isArray(rawAttendances)
    ? rawAttendances
    : (Array.isArray((rawAttendances as any)?.data) ? (rawAttendances as any).data : []);

  const presenceTrend = Array.isArray(rawPresenceTrend)
    ? rawPresenceTrend
    : (Array.isArray((rawPresenceTrend as any)?.data) ? (rawPresenceTrend as any).data : []);

  const totals = dashboardData?.totals || {};
  const presentCount = todayAttendances.length;
  const totalEmployees = totals?.total_employees ?? 0;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;
  const lateCount = todayAttendances.filter((a: any) => String(a.status).toLowerCase() === 'late').length;

  const enrichedTotals = {
    ...totals,
    total_present: presentCount,
    attendance_rate: attendanceRate,
    total_late: lateCount,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8"
    >
      {/* KPI Section */}
      <ExecutiveKpiCards totals={enrichedTotals} loading={dashboardLoading || attendancesLoading} />

      {/* Main Stats Layer: Asymmetric Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
         <AttendanceChart data={presenceTrend} loading={trendLoading} />
         <WorkforceSplit />
      </div>

      {/* Failures & Monitoring Layer */}
      <RecentAttendanceFailures 
        attendances={todayAttendances} 
        loading={attendancesLoading} 
      />
      
      {/* Layout breathing space */}
      <div className="h-10" />
    </motion.div>
  );
}
