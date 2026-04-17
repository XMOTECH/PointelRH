import { cn } from '../../../lib/utils';
import { format } from 'date-fns';

interface AttendanceItem {
  id?: string;
  status: string;
  employee_name?: string;
  clock_in?: string;
  late_minutes?: number;
  location_name?: string;
}

interface RecentAttendanceFailuresProps {
  attendances: AttendanceItem[];
  loading: boolean;
}

const statusLabels: Record<string, string> = {
  late: 'Retard',
  absent: 'Absent',
};

export function RecentAttendanceFailures({ attendances, loading }: RecentAttendanceFailuresProps) {
  const failures = (attendances || []).filter((a: AttendanceItem) =>
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
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-display font-bold text-on-surface">Anomalies de Pointage</h3>
        <p className="text-[11px] font-medium text-on-surface-variant/50 uppercase tracking-widest mt-1">
          Exceptions détectées demandant une attention particulière
        </p>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-6 px-4 py-3 text-[10px] font-space font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] border-b border-outline-variant/30">
        <span>Employé</span>
        <span>Heure</span>
        <span>Retard</span>
        <span>Lieu</span>
        <span>Statut</span>
        <span className="text-right">Action</span>
      </div>

      {/* Table body */}
      <div className="flex flex-col">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant/50 text-sm">Chargement...</div>
        ) : failures.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant/40 text-sm italic">
            Aucune anomalie critique aujourd'hui
          </div>
        ) : (
          failures.map((item, idx) => {
            const statusKey = String(item.status).toLowerCase();
            const isDanger = statusKey === 'absent';
            return (
              <div
                key={item.id || idx}
                className={cn(
                  "grid grid-cols-6 items-center px-4 py-3.5 border-b border-outline-variant/10 last:border-b-0 transition-colors duration-150 hover:bg-surface-container-low/50",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center text-primary font-semibold text-xs">
                    {item.employee_name?.charAt(0) || 'E'}
                  </div>
                  <span className="text-sm font-medium text-on-surface truncate">
                    {item.employee_name}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant/70">
                  {formatTimeSafe(item.clock_in)}
                </span>
                <span className="text-xs font-semibold text-amber-600">
                  {item.late_minutes ? `+${item.late_minutes} min` : '—'}
                </span>
                <span className="text-xs text-on-surface-variant/70 truncate" title={item.location_name}>
                  {item.location_name || '—'}
                </span>
                <div>
                  <span className={cn(
                    "text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider",
                    isDanger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {statusLabels[statusKey] || item.status}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button className="text-[11px] font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                    Détails
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
