import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ShieldAlert } from 'lucide-react';

interface AttendanceAnomaly {
  id: string;
  status: string;
  employee_name?: string;
}

interface GeofencingAlertsProps {
  attendances: AttendanceAnomaly[];
}

export function GeofencingAlerts({ attendances }: GeofencingAlertsProps) {
  const anomalies = (attendances || [])
    .filter(
      (a: AttendanceAnomaly) =>
        String(a.status).toLowerCase() === 'late' ||
        String(a.status).toLowerCase() === 'absent'
    )
    .slice(0, 5);

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-row justify-between items-center mb-4 px-0 pt-0">
        <div className="flex items-center gap-2.5 text-rose-600">
          <ShieldAlert size={20} />
          <CardTitle className="text-base sm:text-lg font-semibold text-on-surface">
            Alertes Géo-fencing & Présence
          </CardTitle>
        </div>
      </CardHeader>

      <div className="flex flex-col gap-2.5">
        {anomalies.length === 0 ? (
          <div className="p-6 text-center bg-surface-container-low rounded-xl border border-on-surface/5">
            <p className="text-xs font-medium text-on-surface-variant">Aucune anomalie détectée</p>
          </div>
        ) : (
          anomalies.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 bg-rose-50/50 rounded-xl flex items-center justify-between border border-rose-200/60"
            >
              <div>
                <p className="text-xs sm:text-sm font-semibold text-on-surface">
                  {item.employee_name || 'Collaborateur'}
                </p>
                <span className="text-[11px] text-on-surface-variant/70">
                  Terminal Gouv.sn
                </span>
              </div>
              <StatusBadge status={item.status} size="sm" />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
