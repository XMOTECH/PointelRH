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
    { label: 'Présences', value: totals?.total_present ?? 0, icon: <Users size={20} />, color: '#10b981' }, // emerald-500
    { label: 'Retards', value: totals?.total_late ?? 0, icon: <Clock size={20} />, color: '#f59e0b' }, // amber-500
    { label: 'Absences', value: totals?.total_absent ?? 0, icon: <UserMinus size={20} />, color: '#ef4444' }, // red-500
    { label: 'Effectif Total', value: totals?.total_employees ?? 0, icon: <Activity size={20} />, color: '#3b82f6' }, // blue-500
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {cards.map((card, i) => (
        <div key={i} className="card" style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'default',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start' 
          }}>
            <div style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '12px', 
              backgroundColor: `${card.color}15`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: card.color,
              boxShadow: `0 4px 12px ${card.color}20`
            }}>
              {card.icon}
            </div>
            {/* Subtle trend or indicator placeholder */}
            <div style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '20px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
              Aujourd'hui
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)', margin: 0 }}>
              {card.label}
            </h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-header)', letterSpacing: '-0.025em' }}>
                {loading ? (
                  <div style={{ width: '40px', height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                ) : card.value}
              </span>
              {!loading && card.label === 'Présences' && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Temps réel</span>
              )}
            </div>
          </div>
          
          {/* Decorative element */}
          <div style={{ 
            position: 'absolute', 
            right: '-10px', 
            bottom: '-10px', 
            opacity: 0.03, 
            transform: 'scale(2.5)' 
          }}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
