import { motion } from 'framer-motion';
import { History, Clock, AlertTriangle, Timer } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMyAttendance } from './hooks/useMyAttendance';
import { AttendanceHeatmap } from './components/AttendanceHeatmap';

function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'HH:mm');
  } catch {
    return '—';
  }
}



function getAttendanceLateness(a: any): number {
  if (a.late_minutes != null && a.late_minutes > 0) return a.late_minutes;
  if (a.lateMinutes != null && a.lateMinutes > 0) return a.lateMinutes;

  const inTimeStr = a.checked_in_at || a.clock_in || a.clockIn;
  if (!inTimeStr) return 0;

  const clockInDate = new Date(inTimeStr);
  const expectedDate = new Date(clockInDate);
  expectedDate.setHours(8, 0, 0, 0); // Horaire standard 08:00
  const graceMs = 15 * 60 * 1000; // 15 min de tolérance

  if (clockInDate.getTime() > expectedDate.getTime() + graceMs) {
    return Math.max(0, Math.floor((clockInDate.getTime() - expectedDate.getTime()) / 60000));
  }
  return 0;
}

export default function MyAttendancePage() {
  const { data: attendances = [], isLoading } = useMyAttendance();

  const totalCount = attendances.length;
  const lateCount = attendances.filter((a: any) => getAttendanceLateness(a) > 0).length;
  const totalWorkMinutes = attendances.reduce((sum: number, a: any) => sum + (a.work_minutes || a.workMinutes || 0), 0);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-surface-container rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-surface-container rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 w-full"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-on-surface">Mon Historique de Pointage</h1>
        <p className="text-sm text-on-surface-variant mt-1">{totalCount} pointage{totalCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <Clock size={22} className="text-primary shrink-0" />
          <div>
            <p className="text-2xl font-bold text-on-surface">{totalCount}</p>
            <p className="text-xs text-on-surface-variant">Total pointages</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <AlertTriangle size={22} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-on-surface">{lateCount}</p>
            <p className="text-xs text-on-surface-variant">Retards</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Timer size={22} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-on-surface">{formatMinutes(totalWorkMinutes)}</p>
            <p className="text-xs text-on-surface-variant">Heures travaillées</p>
          </div>
        </Card>
      </div>

      {/* GitHub-Style Attendance Heatmap Graph */}
      <AttendanceHeatmap attendances={attendances} />

      {/* Table Unifiée Style Admin */}
      <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl shadow-none overflow-hidden">
        <div className="px-6 py-4 border-b border-on-surface/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface">Derniers pointages</h2>
          <span className="text-xs text-on-surface-variant font-medium">{attendances.length} entrée{attendances.length > 1 ? 's' : ''}</span>
        </div>
        
        {attendances.length === 0 ? (
          <div className="text-center py-12">
            <History size={40} className="mx-auto text-on-surface-variant/30 mb-3" />
            <p className="text-sm font-medium text-on-surface-variant">Aucun pointage enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-on-surface/10 bg-surface-container-low/30">
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Date <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Heure d'Entrée <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Heure de Sortie <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Durée Effectuée <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Retard <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Statut <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Lieu / Canal <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface/10">
                {attendances.map((a: any) => {
                  const inTimeStr = a.checked_in_at || a.clock_in || a.clockIn;
                  const outTimeStr = a.checked_out_at || a.clock_out || a.clockOut;
                  const rawDate = a.work_date || inTimeStr || a.createdAt || a.created_at;

                  // Calculation of work duration if not provided directly
                  let workMins = a.work_minutes ?? a.workMinutes;
                  const isToday = rawDate && new Date(rawDate).toDateString() === new Date().toDateString();

                  if ((workMins === null || workMins === undefined || workMins === 0) && inTimeStr) {
                    if (outTimeStr) {
                      const diffMs = new Date(outTimeStr).getTime() - new Date(inTimeStr).getTime();
                      workMins = Math.max(0, Math.floor(diffMs / 60000));
                    } else if (isToday) {
                      const diffMs = new Date().getTime() - new Date(inTimeStr).getTime();
                      workMins = Math.max(0, Math.floor(diffMs / 60000));
                    }
                  }

                  const lateMins = getAttendanceLateness(a);
                  const isLate = lateMins > 0;

                  return (
                    <tr key={a.id} className="hover:bg-surface-container-low/50 border-b border-on-surface/10 last:border-b-0 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-on-surface whitespace-nowrap">
                        {(() => {
                          if (!rawDate) return 'Aujourd\'hui';
                          try {
                            return format(parseISO(rawDate), 'dd MMMM yyyy', { locale: fr });
                          } catch {
                            return 'Aujourd\'hui';
                          }
                        })()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-on-surface whitespace-nowrap">
                        {formatTime(inTimeStr)}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                        {outTimeStr ? formatTime(outTimeStr) : <span className="text-amber-600 font-semibold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">En cours</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-on-surface whitespace-nowrap">
                        {!outTimeStr && isToday ? (
                          <span className="text-primary font-bold text-xs bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {formatMinutes(workMins)} (en cours)
                          </span>
                        ) : !outTimeStr ? (
                          <span className="text-on-surface-variant/70 text-xs italic">Non clôturé</span>
                        ) : (
                          formatMinutes(workMins)
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isLate ? (
                          <Badge variant="warning">{formatMinutes(lateMins)} de retard</Badge>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">À l'heure</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={isLate ? 'warning' : 'success'}>
                          {isLate ? 'Retard' : 'Présent'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap text-xs">
                        {a.location?.name || a.location_name || a.deviceType || a.device_type || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
