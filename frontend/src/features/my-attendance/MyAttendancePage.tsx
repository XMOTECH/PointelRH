import { motion } from 'framer-motion';
import { History, Clock, AlertTriangle, Timer } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMyAttendance } from './hooks/useMyAttendance';
import type { Attendance } from './types';

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

function statusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status.toLowerCase()) {
    case 'present': return 'success';
    case 'late': return 'warning';
    case 'absent': return 'error';
    default: return 'default';
  }
}

export default function MyAttendancePage() {
  const { data: attendances = [], isLoading } = useMyAttendance();

  const totalCount = attendances.length;
  const lateCount = attendances.filter((a: Attendance) => a.late_minutes > 0).length;
  const totalWorkMinutes = attendances.reduce((sum: number, a: Attendance) => sum + (a.work_minutes || 0), 0);

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
      className="p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Mon Historique de Pointage</h1>
          <p className="text-sm text-on-surface-variant mt-1">{totalCount} pointage{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <History size={28} className="text-on-surface-variant/30" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{totalCount}</p>
            <p className="text-xs text-on-surface-variant">Total pointages</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{lateCount}</p>
            <p className="text-xs text-on-surface-variant">Retards</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Timer size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{formatMinutes(totalWorkMinutes)}</p>
            <p className="text-xs text-on-surface-variant">Heures travaillées</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers pointages</CardTitle>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <div className="text-center py-12">
              <History size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
              <p className="text-on-surface-variant">Aucun pointage enregistré</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-container">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Entrée</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sortie</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Durée</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Retard</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Statut</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Lieu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/50">
                  {attendances.map((a: Attendance) => (
                    <tr key={a.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-on-surface">
                        {format(parseISO(a.work_date), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-3 px-2 text-on-surface-variant">{formatTime(a.checked_in_at)}</td>
                      <td className="py-3 px-2 text-on-surface-variant">{formatTime(a.checked_out_at)}</td>
                      <td className="py-3 px-2 text-on-surface-variant">{formatMinutes(a.work_minutes)}</td>
                      <td className="py-3 px-2">
                        {a.late_minutes > 0 ? (
                          <Badge variant="warning">{a.late_minutes}min</Badge>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={statusBadgeVariant(a.status)}>{a.status_label}</Badge>
                      </td>
                      <td className="py-3 px-2 text-on-surface-variant">{a.location_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
