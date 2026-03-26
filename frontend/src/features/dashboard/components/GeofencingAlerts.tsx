import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
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
  const anomalies = (attendances || []).filter((a: AttendanceAnomaly) => 
    String(a.status).toLowerCase() === 'late' || 
    String(a.status).toLowerCase() === 'absent'
  ).slice(0, 5);

  return (
    <Card className="bg-surface-container-lowest border-none p-6">
      <CardHeader className="flex flex-row justify-between items-center mb-6 px-0 pt-0">
        <div className="flex items-center gap-3 text-red-600">
           <ShieldAlert size={20} />
           <CardTitle className="text-xl font-display font-bold">Alertes Géo-fencing</CardTitle>
        </div>
      </CardHeader>

      <div className="flex flex-col gap-3">
        {anomalies.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-on-surface/5">
            <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Aucune alerte active</p>
          </div>
        ) : (
          anomalies.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="p-4 bg-red-50 rounded-2xl flex flex-col gap-1 border border-red-100"
            >
              <span className="text-xs font-bold text-red-600 uppercase tracking-tighter">{item.status}</span>
              <p className="text-sm font-bold text-on-surface">{item.employee_name}</p>
              <span className="text-[10px] font-medium text-on-surface-variant opacity-60">Terminal Gouv.sn</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
