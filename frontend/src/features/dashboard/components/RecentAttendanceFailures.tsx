import React from 'react';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';

interface RecentAttendanceFailuresProps {
  attendances: any[];
  loading: boolean;
}

export function RecentAttendanceFailures({ attendances, loading }: RecentAttendanceFailuresProps) {
  const failures = (attendances || []).filter((a: any) => 
    String(a.status).toLowerCase() === 'late' || 
    String(a.status).toLowerCase() === 'absent'
  ).slice(0, 5);

  const formatTimeSafe = (dateString?: string) => {
    if (!dateString) return '--:--';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '--:--';
    return format(d, 'HH:mm');
  };

  return (
    <Card className="flex-1 bg-surface-container-lowest border-none p-8 mt-8">
      <CardHeader className="flex flex-row justify-between items-center mb-8 px-0">
        <div>
          <CardTitle className="text-2xl font-display font-bold text-on-surface">Anomalies de Pointage</CardTitle>
          <p className="text-xs font-medium text-on-surface-variant opacity-50 uppercase tracking-widest mt-1">Exceptions détectées demandant une attention particulière</p>
        </div>
      </CardHeader>

      <div className="flex flex-col">
        <div className="grid grid-cols-6 px-4 py-3 mb-2 text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">
          <span>Employé</span>
          <span>Heure</span>
          <span>Retard</span>
          <span>Lieu</span>
          <span>Type d'Erreur</span>
          <span className="text-right">Action</span>
        </div>
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant opacity-50">Chargement...</div>
          ) : failures.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant opacity-30 italic">Aucune anomalie critique aujourd'hui</div>
          ) : (
            failures.map((item, idx) => {
              const type = String(item.status).toLowerCase() === 'late' ? 'warning' : 'danger';
              return (
                <div
                  key={item.id || idx}
                  className={cn(
                    "grid grid-cols-6 items-center px-4 py-4 rounded-xl transition-all duration-200 hover:scale-[1.01]",
                    idx % 2 === 0 ? "bg-surface" : "bg-surface-container-low"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-sm">
                      {item.employee_name?.charAt(0) || 'E'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface leading-tight">{item.employee_name}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant opacity-70">
                    {formatTimeSafe(item.clock_in)}
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    {item.late_minutes ? `+${item.late_minutes} min` : '—'}
                  </span>
                  <span className="text-xs font-medium text-on-surface-variant opacity-70 truncate" title={item.location_name}>
                    {item.location_name || '—'}
                  </span>
                  <div>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full tracking-tighter uppercase",
                      type === 'danger' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                     <button className="btn-tertiary !text-[10px] !px-3 !py-1">Détails</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
