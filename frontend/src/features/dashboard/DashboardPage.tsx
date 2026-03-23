import { useState } from 'react';
import { useDashboard, useAttendancesToday } from './hooks/useDashboard';
import { KpiCards } from './components/KpiCards';
import { PresenceChart } from './components/PresenceChart';
import { format } from 'date-fns';
import { Clock, Filter, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui/Spinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');
  const { data: rawDashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: rawAttendances, isLoading: attendancesLoading } = useAttendancesToday();

  // Assurer que les données sont correctement extraites
  const dashboardData = (rawDashboardData as any)?.data || rawDashboardData || {};
  const todayAttendances = Array.isArray(rawAttendances)
    ? rawAttendances
    : (Array.isArray((rawAttendances as any)?.data) ? (rawAttendances as any).data : []);

  const totals = dashboardData?.totals || {};
  
  // Préférer les données temps réel des pointages si disponibles pour aujourd'hui
  const presentCount = todayAttendances.length;
  const lateCount = todayAttendances.filter((a: any) => String(a.status).toLowerCase() === 'late').length;
  const totalEmployees = totals?.total_employees ?? 0;
  
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  // Stats fusionnées
  const enrichedTotals = {
    total_present: presentCount,
    total_late: lateCount,
    total_absent: Math.max(0, totalEmployees - presentCount),
    total_employees: totalEmployees,
  };

  const formatTimeSafe = (dateString?: string) => {
    if (!dateString) return '--:--';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '--:--';
    return format(d, 'HH:mm');
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Premium Header */}
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>
            Tableau de Bord
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.4rem' }}>
            Bienvenue, <strong>{user?.name || 'Administrateur'}</strong>. Voici un aperçu de l'activité.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '0.4rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="#64748b" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>{format(new Date(), 'dd MMMM yyyy')}</span>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            style={{ 
              padding: '0.6rem 1.25rem', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              backgroundColor: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
          </select>
        </div>
      </header>

      {/* KPI Cards Section */}
      <KpiCards totals={enrichedTotals} loading={dashboardLoading || attendancesLoading} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Chart Area */}
          <PresenceChart period={period} />
          
          {/* Attendance Rate Banner Component */}
          <div className="card" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            borderRadius: '24px',
            color: 'white',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(30, 41, 59, 0.2)'
          }}>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Statistiques de Présence</h3>
                <p style={{ opacity: 0.7, fontSize: '0.875rem', marginTop: '0.5rem' }}>Taux de présence global pour aujourd'hui</p>
                <div style={{ display: 'flex', gap: '3rem', marginTop: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{presentCount}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Présents</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{attendanceRate}%</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taux</div>
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#3b82f6" strokeWidth="12" 
                          strokeDasharray={339.29} 
                          strokeDashoffset={339.29 - (339.29 * attendanceRate / 100)}
                          strokeLinecap="round" 
                          transform="rotate(-90 60 60)" />
                </svg>
                <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 800 }}>{attendanceRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Feed Column */}
        <div className="card" style={{ 
          padding: '1.5rem', 
          borderRadius: '24px', 
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          height: '100%',
          maxHeight: '750px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Pointages Récents</h3>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '20px', padding: '0.2rem 0.75rem' }}>
              {attendancesLoading ? '...' : `${presentCount} aujourd'hui`}
            </div>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {attendancesLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size="md" /></div>
            ) : todayAttendances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                <Clock size={40} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Aucun pointage pour le moment</p>
              </div>
            ) : (
              todayAttendances.map((att: any, idx: number) => {
                const isLate = String(att.status).toLowerCase() === 'late';
                return (
                  <div key={att.id || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 0',
                    borderBottom: idx === todayAttendances.length - 1 ? 'none' : '1px solid #f1f5f9'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      backgroundColor: isLate ? '#fff7ed' : '#f0fdf4',
                      color: isLate ? '#c2410c' : '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.875rem'
                    }}>
                      {att.employee_name?.charAt(0) || 'E'}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{att.employee_name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {formatTimeSafe(att.clock_in)}
                      </p>
                    </div>
                    {isLate && (
                      <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.625rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                        RETARD
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
          
          <button className="btn" style={{ 
            marginTop: '1.5rem', 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '12px', 
            backgroundColor: '#f1f5f9', 
            color: '#475569', 
            fontSize: '0.8125rem', 
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}>
            Voir tous les rapports
          </button>
        </div>
      </div>
    </div>
  );
}
