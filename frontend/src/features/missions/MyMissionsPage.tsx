import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { missionsApi, type MyMission } from './api/missions.api';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  active: { label: 'Active', variant: 'success' },
  draft: { label: 'Brouillon', variant: 'default' },
  completed: { label: 'Terminee', variant: 'info' },
  cancelled: { label: 'Annulee', variant: 'error' },
};

const ASSIGNMENT_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  assigned: { label: 'Assignee', variant: 'warning' },
  seen: { label: 'Vue', variant: 'info' },
  completed: { label: 'Terminee', variant: 'success' },
};

function MissionCard({ mission }: { mission: MyMission }) {
  const status = STATUS_CONFIG[mission.status] || STATUS_CONFIG.draft;
  const assignment = ASSIGNMENT_CONFIG[mission.assignment_status] || ASSIGNMENT_CONFIG.assigned;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-on-surface truncate">{mission.title}</h3>
            {mission.description && (
              <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{mission.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-on-surface-variant">
              {mission.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
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
                {mission.start_date}
                {mission.end_date && ` → ${mission.end_date}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Assignee le {new Date(mission.assigned_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {mission.comment && (
              <p className="text-xs text-on-surface-variant/80 mt-2 italic">"{mission.comment}"</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant={assignment.variant}>{assignment.label}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
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

  const activeMissions = (missions || []).filter((m: MyMission) => m.status === 'active' && m.assignment_status !== 'completed');
  const completedMissions = (missions || []).filter((m: MyMission) => m.assignment_status === 'completed' || m.status === 'completed');
  const otherMissions = (missions || []).filter((m: MyMission) =>
    !activeMissions.includes(m) && !completedMissions.includes(m)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Mes Missions</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {missions?.length || 0} mission(s) assignee(s)
          </p>
        </div>
      </div>

      {(!missions || missions.length === 0) && (
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

      {activeMissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface uppercase tracking-wider">
            <AlertCircle size={16} className="text-warning" />
            En cours ({activeMissions.length})
          </h2>
          {activeMissions.map((m: MyMission) => <MissionCard key={m.id} mission={m} />)}
        </div>
      )}

      {otherMissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Autres ({otherMissions.length})
          </h2>
          {otherMissions.map((m: MyMission) => <MissionCard key={m.id} mission={m} />)}
        </div>
      )}

      {completedMissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            <CheckCircle2 size={16} className="text-green-600" />
            Terminees ({completedMissions.length})
          </h2>
          {completedMissions.map((m: MyMission) => <MissionCard key={m.id} mission={m} />)}
        </div>
      )}
    </motion.div>
  );
}
