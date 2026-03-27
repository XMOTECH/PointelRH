import { useDashboard, useAttendancesToday, usePresenceTrend } from './hooks/useDashboard';
import { ExecutiveKpiCards } from './components/ExecutiveKpiCards';
import { AttendanceChart } from './components/AttendanceChart';
import { WorkforceSplit } from './components/WorkforceSplit';
import { RecentAttendanceFailures } from './components/RecentAttendanceFailures';
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

  // Data processing
  const dashboardData = rawDashboardData || {};
  const todayAttendances = Array.isArray(rawAttendances)
    ? rawAttendances
    : [];

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8"
    >
      {/* Dashboard Header with Date Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">Tableau de Bord</h1>
          <p className="text-on-surface-variant opacity-70 text-sm mt-1">
            {period === 'day' 
              ? (selectedDate === new Date().toISOString().split('T')[0] ? "Activité d'aujourd'hui" : `Activité du ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`)
              : period === 'week' 
                ? `Activité de la semaine du ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                : `Activité du mois de ${new Date(selectedDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === p 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'text-on-surface-variant opacity-60 hover:opacity-100'
                }`}
              >
                {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-2xl shadow-sm border border-outline-variant/10">
            <Calendar className="text-primary ml-2" size={20} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="bg-transparent border-none text-on-surface font-medium text-sm focus:ring-0 outline-none cursor-pointer pr-4"
            />
          </div>
        </div>
      </div>

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
