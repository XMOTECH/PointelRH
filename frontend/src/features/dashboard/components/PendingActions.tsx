import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import type { LeaveRequest } from '../../leaves/api/leaves.api';
import type { Task } from '../../tasks/api/tasks.api';

interface AttendanceItem {
  id?: string;
  status: string;
  employee_name?: string;
  clock_in?: string;
  late_minutes?: number;
  location_name?: string;
}

interface PendingActionsProps {
  attendances: AttendanceItem[];
  attendancesLoading: boolean;
  pendingLeaves: LeaveRequest[];
  overdueTasks: Task[];
  sirhLoading: boolean;
}

type TabKey = 'anomalies' | 'leaves' | 'tasks';

const statusLabels: Record<string, string> = {
  late: 'Retard',
  absent: 'Absent',
};

const priorityLabels: Record<string, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

export function PendingActions({ attendances, attendancesLoading, pendingLeaves, overdueTasks, sirhLoading }: PendingActionsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('anomalies');

  const failures = (attendances || []).filter((a) =>
    String(a.status).toLowerCase() === 'late' ||
    String(a.status).toLowerCase() === 'absent'
  ).slice(0, 5);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'anomalies', label: 'Anomalies', count: failures.length },
    { key: 'leaves', label: 'Congés', count: pendingLeaves.length },
    { key: 'tasks', label: 'Tâches', count: overdueTasks.length },
  ];

  const formatTimeSafe = (dateString?: string) => {
    if (!dateString) return '--:--';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '--:--';
    return format(d, 'HH:mm');
  };

  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd/MM/yyyy');
  };

  const isLoading = activeTab === 'anomalies' ? attendancesLoading : sirhLoading;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="text-lg font-display font-bold text-on-surface">Actions Requises</h3>
          <p className="text-[11px] font-medium text-on-surface-variant/50 uppercase tracking-widest mt-1">
            Elements en attente de votre attention
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeTab === tab.key
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant/60 hover:text-on-surface"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                  activeTab === tab.key
                    ? "bg-on-primary/20 text-on-primary"
                    : "bg-surface-container-highest text-on-surface-variant"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-12 text-center text-on-surface-variant/50 text-sm">Chargement...</div>
      ) : (
        <>
          {/* Anomalies Tab */}
          {activeTab === 'anomalies' && (
            <>
              <div className="grid grid-cols-6 px-4 py-3 text-[10px] font-space font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] border-b border-outline-variant/30">
                <span>Employé</span>
                <span>Heure</span>
                <span>Retard</span>
                <span>Lieu</span>
                <span>Statut</span>
                <span className="text-right">Action</span>
              </div>
              {failures.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant/40 text-sm italic">
                  Aucune anomalie aujourd'hui
                </div>
              ) : (
                failures.map((item, idx) => {
                  const statusKey = String(item.status).toLowerCase();
                  const isDanger = statusKey === 'absent';
                  return (
                    <div
                      key={item.id || idx}
                      className="grid grid-cols-6 items-center px-4 py-3.5 border-b border-outline-variant/10 last:border-b-0 transition-colors duration-150 hover:bg-surface-container-low/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center text-primary font-semibold text-xs">
                          {item.employee_name?.charAt(0) || 'E'}
                        </div>
                        <span className="text-sm font-medium text-on-surface truncate">{item.employee_name}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant/70">{formatTimeSafe(item.clock_in)}</span>
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
            </>
          )}

          {/* Congés Tab */}
          {activeTab === 'leaves' && (
            <>
              <div className="grid grid-cols-5 px-4 py-3 text-[10px] font-space font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] border-b border-outline-variant/30">
                <span>Employé</span>
                <span>Type</span>
                <span>Début</span>
                <span>Fin</span>
                <span className="text-right">Jours</span>
              </div>
              {pendingLeaves.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant/40 text-sm italic">
                  Aucune demande de congé en attente
                </div>
              ) : (
                pendingLeaves.slice(0, 5).map((leave) => (
                  <div
                    key={leave.id}
                    className="grid grid-cols-5 items-center px-4 py-3.5 border-b border-outline-variant/10 last:border-b-0 transition-colors duration-150 hover:bg-surface-container-low/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-semibold text-xs">
                        {(leave.employee_name || leave.employee?.first_name || 'E').charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-on-surface truncate">
                        {leave.employee_name || (leave.employee ? `${leave.employee.first_name} ${leave.employee.last_name}` : '—')}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant/70 truncate">
                      {typeof leave.leave_type === 'string' ? leave.leave_type : leave.leave_type?.name || '—'}
                    </span>
                    <span className="text-xs text-on-surface-variant/70">{formatDateSafe(leave.start_date)}</span>
                    <span className="text-xs text-on-surface-variant/70">{formatDateSafe(leave.end_date)}</span>
                    <div className="flex justify-end">
                      <span className="text-sm font-semibold text-on-surface">
                        {leave.days_count ?? '—'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Tâches Tab */}
          {activeTab === 'tasks' && (
            <>
              <div className="grid grid-cols-5 px-4 py-3 text-[10px] font-space font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] border-b border-outline-variant/30">
                <span className="col-span-2">Tâche</span>
                <span>Assigné à</span>
                <span>Échéance</span>
                <span className="text-right">Priorité</span>
              </div>
              {overdueTasks.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant/40 text-sm italic">
                  Aucune tâche en retard
                </div>
              ) : (
                overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-5 items-center px-4 py-3.5 border-b border-outline-variant/10 last:border-b-0 transition-colors duration-150 hover:bg-surface-container-low/50"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-semibold text-xs">
                        {task.title?.charAt(0) || 'T'}
                      </div>
                      <span className="text-sm font-medium text-on-surface truncate">{task.title}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant/70 truncate">
                      {task.assignee_name || '—'}
                    </span>
                    <span className="text-xs font-semibold text-red-600">
                      {formatDateSafe(task.due_date ?? undefined)}
                    </span>
                    <div className="flex justify-end">
                      <span className={cn(
                        "text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        task.priority === 'high' ? "bg-red-50 text-red-600" :
                        task.priority === 'medium' ? "bg-amber-50 text-amber-600" :
                        "bg-surface-container-high text-on-surface-variant"
                      )}>
                        {priorityLabels[task.priority] || task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
