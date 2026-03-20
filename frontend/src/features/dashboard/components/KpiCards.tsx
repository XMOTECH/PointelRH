import React from 'react';
import { Users, Clock, UserMinus, Activity } from 'lucide-react';

interface Kpi {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function KpiCards({ totals, loading }: { totals: any; loading: boolean }) {
  const cards: Kpi[] = [
    { label: 'Présents', value: totals?.total_present ?? 0, icon: <Users size={18} />, color: 'var(--success)' },
    { label: 'Retards', value: totals?.total_late ?? 0, icon: <Clock size={18} />, color: 'var(--warning)' },
    { label: 'Absents', value: totals?.total_absent ?? 0, icon: <UserMinus size={18} />, color: 'var(--danger)' },
    { label: 'Total Employés', value: totals?.total_employees ?? 0, icon: <Activity size={18} />, color: 'var(--info)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {cards.map((card, i) => (
        <div key={i} className="card" style={{ 
          padding: '1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle accent bar */}
          <div style={{ 
            position: 'absolute', 
            left: 0, 
            top: 0, 
            bottom: 0, 
            width: '4px', 
            backgroundColor: card.color 
          }} />
          
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: `${card.color}10`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: card.color 
          }}>
            {card.icon}
          </div>
          
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em', margin: 0 }}>
              {card.label}
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-header)', margin: '0.125rem 0 0 0' }}>
              {loading ? '...' : card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
