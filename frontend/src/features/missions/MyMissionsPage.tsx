import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Target,
  Clock,
} from 'lucide-react';
import { missionsApi, type MyMission } from './api/missions.api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-primary/10 text-primary' },
  draft: { label: 'Brouillon', color: 'bg-surface-container text-on-surface-variant' },
  completed: { label: 'Terminee', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulee', color: 'bg-red-100 text-red-700' },
};

function MissionCard({ mission }: { mission: MyMission }) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[mission.status] || STATUS_CONFIG.draft;
  const stats = mission.stats;
  const progression = stats?.progression_percentage ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(`/my-missions/${mission.id}`)}
      className="premium-card p-5 cursor-pointer group transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-on-surface text-sm truncate group-hover:text-primary transition-colors">
              {mission.title}
            </h3>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0', status.color)}>
              {status.label}
            </span>
          </div>

          {mission.description && (
            <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">{mission.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
            {mission.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-primary" />
                {mission.location}
              </span>
            )}
            {mission.department && (
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {mission.department}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(mission.start_date), 'dd MMM yyyy', { locale: fr })}
              {mission.end_date && ` — ${format(new Date(mission.end_date), 'dd MMM', { locale: fr })}`}
            </span>
          </div>

          {/* Progression bar */}
          {stats && stats.total_tasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <Target size={10} />
                  {stats.completed_tasks}/{stats.total_tasks} taches
                </span>
                <span className={cn(
                  'text-[10px] font-bold',
                  progression === 100 ? 'text-emerald-600' : progression > 50 ? 'text-primary' : 'text-on-surface-variant'
                )}>
                  {progression}%
                </span>
              </div>
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    progression === 100 ? 'bg-emerald-500' : 'bg-primary'
                  )}
                  style={{ width: `${progression}%` }}
                />
              </div>
            </div>
          )}

          {stats && stats.total_tasks === 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-on-surface-variant/50">
              <Clock size={10} />
              Aucune tache assignee
            </div>
          )}
        </div>

        <ChevronRight size={18} className="text-on-surface-variant/30 group-hover:text-primary shrink-0 mt-1 transition-colors" />
      </div>
    </motion.div>
  );
}

export function MyMissionsPage() {
  const { data: missions, isLoading } = useQuery({
    queryKey: ['my-missions'],
    queryFn: () => missionsApi.getMyMissions().then(r => r.data?.data ?? r.data),
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-surface-container rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const all = missions || [];
  const activeMissions = all.filter((m: MyMission) => m.status === 'active' && m.assignment_status !== 'completed');
  const completedMissions = all.filter((m: MyMission) => m.assignment_status === 'completed' || m.status === 'completed');
  const otherMissions = all.filter((m: MyMission) => !activeMissions.includes(m) && !completedMissions.includes(m));

  const totalTasks = all.reduce((acc: number, m: MyMission) => acc + (m.stats?.total_tasks || 0), 0);
  const completedTasks = all.reduce((acc: number, m: MyMission) => acc + (m.stats?.completed_tasks || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Briefcase size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Mes Missions</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {all.length} mission{all.length > 1 ? 's' : ''} — {completedTasks}/{totalTasks} taches completees
          </p>
        </div>
      </div>

      {/* Empty state */}
      {all.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-on-surface-variant/40" />
          </div>
          <p className="text-on-surface-variant font-medium">Aucune mission assignee</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">
            Vos missions apparaitront ici quand votre manager vous en assignera.
          </p>
        </div>
      )}

      {/* Active missions */}
      {activeMissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
            <AlertCircle size={14} className="text-primary" />
            En cours ({activeMissions.length})
          </h2>
          <div className="grid gap-3">
            {activeMissions.map((m: MyMission) => <MissionCard key={m.id} mission={m} />)}
          </div>
        </div>
      )}

      {/* Other missions */}
      {otherMissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Autres ({otherMissions.length})
          </h2>
          <div className="grid gap-3">
            {otherMissions.map((m: MyMission) => <MissionCard key={m.id} mission={m} />)}
          </div>
        </div>
      )}

      {/* Completed missions */}
      {completedMissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Terminees ({completedMissions.length})
          </h2>
          <div className="grid gap-3">
            {completedMissions.map((m: MyMission) => <MissionCard key={m.id} mission={m} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}
