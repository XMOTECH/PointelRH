import { useState } from 'react';
import { useDashboard, useAttendancesToday } from './hooks/useDashboard';
import { KpiCards } from './components/KpiCards';
import { PresenceChart } from './components/PresenceChart';
import { format } from 'date-fns';
import { Clock, Filter } from 'lucide-react';

export default function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: todayAttendances, isLoading: attendancesLoading } = useAttendancesToday();

  return (
    <div className="dashboard-container">
      {/* Page Header within Content */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Bonjour, Administrateur</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Voici l'état de votre entreprise aujourd'hui.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as any)}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
          </select>
          <button className="btn btn-primary">
            <Filter size={16} />
            Filtrer
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <KpiCards totals={dashboardData} loading={dashboardLoading} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Chart Section */}
        <PresenceChart period={period} />

        {/* Recent Attendance Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-header)', margin: 0 }}>Pointages Récents</h3>
            <button style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>Voir tout</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {attendancesLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chargement...</p>
            ) : todayAttendances?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#F8F9FA', borderRadius: 'var(--radius-md)' }}>
                <Clock size={32} style={{ color: '#CBD5E0', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>Aucun pointage aujourd'hui</p>
              </div>
            ) : (
              todayAttendances?.slice(0, 5).map((att: any) => (
                <div key={att.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  paddingBottom: '1rem', 
                  borderBottom: '1px solid var(--border-light)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}>
                      {att.employee_name?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-header)', margin: 0 }}>{att.employee_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{format(new Date(att.clock_in), 'HH:mm')}</p>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.6875rem', 
                    fontWeight: 700,
                    backgroundColor: att.status === 'Late' ? '#FFF5F5' : '#F0FFF4',
                    color: att.status === 'Late' ? '#E53E3E' : '#38A169'
                  }}>
                    {att.status === 'Late' ? 'RETARD' : 'PRÉSENT'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
