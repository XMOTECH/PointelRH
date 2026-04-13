import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  TrendingUp,
  Target
} from 'lucide-react';
import { missionsApi } from './api/missions.api';
import type { Mission } from './api/missions.api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const MissionTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [incidentData, setIncidentData] = useState({ title: '', description: '', severity: 'medium' });

  useEffect(() => {
    if (id) {
      loadMission();
    }
  }, [id]);

  const loadMission = async () => {
    try {
      setIsLoading(true);
      const response = await missionsApi.getMission(id!);
      setMission(response.data.data);
    } catch (error) {
      console.error('Failed to load mission tracking data', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!mission) return <div>Mission non trouvée</div>;

  const formatElapsed = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = Math.abs(now.getTime() - start.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-surface">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/missions')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux missions
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-space font-bold text-on-surface tracking-tight">
                {mission.title}
              </h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                mission.status === 'active' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {mission.status === 'active' ? 'En Direct' : mission.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {mission.location || 'Site distant'}
              </div>
              <div className="flex items-center gap-1.5 border-l border-outline pl-4">
                <Clock className="w-4 h-4 text-primary" />
                {format(new Date(mission.start_date), 'dd MMMM yyyy', { locale: fr })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="rounded-xl px-6 h-12"
              onClick={() => setShowIncidentModal(true)}
            >
              Rapport d'incident
            </Button>
            <Button
              className="btn-primary rounded-xl px-6 h-12"
              onClick={() => toast.success('Moniteur live activé')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Live Monitor
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Équipe mobilisée"
          value={mission.employees?.length.toString() || '0'}
          subValue="Sur le terrain"
          color="blue"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Progression"
          value={mission.stats ? `${mission.stats.progression_percentage}%` : '0%'}
          subValue={`${mission.stats?.completed_tasks || 0} / ${mission.stats?.total_tasks || 0} tâches`}
          color="emerald"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Temps écoulé"
          value={mission.status === 'active' ? formatElapsed(mission.start_date) : '-'}
          subValue={`Démarré le ${format(new Date(mission.start_date), 'dd/MM')}`}
          color="amber"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Productivité"
          value={mission.stats && mission.stats.progression_percentage > 50 ? "Optimale" : "En cours"}
          subValue="Basé sur les tâches"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Tracking */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-space font-bold">Personnel assigné</h3>
              <Button variant="tertiary" size="sm">Tout voir</Button>
            </div>

            <div className="space-y-1">
              {mission.employees?.map((emp, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={emp.id}
                  className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary ring-2 ring-white shadow-inner">
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{emp.first_name} {emp.last_name}</h4>
                      <p className="text-xs text-on-surface-variant font-medium opacity-70 capitalize">{emp.role || 'Technicien'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Statut local</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Check-in à 08:45
                      </div>
                    </div>

                    <button
                      className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 italic"
                      onClick={() => toast.success(`Contacter ${emp.first_name}...`)}
                    >
                      <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-white/20 h-64 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1/800x600?access_token=pk.placeholder')] bg-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <MapPin className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg">Suivi Géographique</h4>
                <p className="text-sm text-on-surface-variant font-medium">Dernière position connue à 10:30</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full px-8 bg-white/50 backdrop-blur-md border-white/20"
                onClick={() => toast('Carte temps réel en cours de chargement...')}
              >
                Agrandir la carte
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline / Activity */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border-white/20">
            <h3 className="text-xl font-space font-bold mb-8">Journal d'activité</h3>
            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
              {mission.activity_log && mission.activity_log.length > 0 ? (
                mission.activity_log.map((item, idx) => (
                  <TimelineItem
                    key={idx}
                    time={item.time}
                    title={item.title}
                    description={item.description}
                    color={item.color}
                    isCurrent={idx === 0}
                  />
                ))
              ) : (
                <div className="text-center py-10 opacity-40 italic text-sm">Aucune activité enregistrée</div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-3xl text-on-primary shadow-xl shadow-primary/20">
            <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Instructions de sécurité</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-6 font-medium">
              Veuillez vous assurer que tous les équipements de protection individuelle sont portés avant le début de l'intervention.
            </p>
            <Button
              className="w-full bg-white text-primary border-none hover:bg-white/90 rounded-2xl h-12"
              onClick={() => toast.error('Documents non disponibles pour cette mission')}
            >
              Consulter les docs
            </Button>
          </div>
        </div>
      </div>

      {/* Incident Modal */}
      <AnimatePresence>
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIncidentModal(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface p-8 rounded-[32px] shadow-2xl space-y-6 border border-outline-variant"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-space font-bold">Signaler un Incident</h3>
                <p className="text-sm text-on-surface-variant">Décrivez la situation pour alerter les responsables.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60">Titre de l'incident</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Panne matériel, Obstruction..."
                    value={incidentData.title}
                    onChange={(e) => setIncidentData({ ...incidentData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60">Sévérité</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high', 'critical'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setIncidentData({ ...incidentData, severity: s })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                          incidentData.severity === s
                            ? "bg-primary text-white border-primary"
                            : "bg-surface-container border-outline-variant text-on-surface-variant"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60">Description détaillée</label>
                  <textarea
                    className="w-full h-32 bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Décrivez précisément ce qui se passe..."
                    value={incidentData.description}
                    onChange={(e) => setIncidentData({ ...incidentData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="tertiary"
                  className="flex-1 rounded-2xl h-12"
                  onClick={() => setShowIncidentModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 btn-primary rounded-2xl h-12"
                  isLoading={isReporting}
                  onClick={async () => {
                    if (!incidentData.title || !incidentData.description) {
                      toast.error('Veuillez remplir tous les champs');
                      return;
                    }
                    try {
                      setIsReporting(true);
                      await missionsApi.reportIncident({
                        mission_id: id,
                        ...incidentData
                      });
                      toast.success('Incident signalé avec succès');
                      setShowIncidentModal(false);
                      setIncidentData({ title: '', description: '', severity: 'medium' });
                    } catch (error) {
                      toast.error('Erreur lors du signalement');
                    } finally {
                      setIsReporting(false);
                    }
                  }}
                >
                  Envoyer le rapport
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color }: any) => {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    indigo: "bg-indigo-500/10 text-indigo-600",
  };

  return (
    <div className="glass p-6 rounded-3xl border-white/20 flex flex-col gap-4 group hover:translate-y-[-4px] transition-transform duration-300">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center ring-4 ring-white shadow-sm", colors[color])}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60 mb-1">{label}</div>
        <div className="text-3xl font-space font-bold tracking-tight">{value}</div>
        <div className="text-[10px] text-on-surface-variant font-medium mt-1">{subValue}</div>
      </div>
    </div>
  );
};

const TimelineItem = ({ time, title, description, color, isCurrent }: any) => {
  const colors: any = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    slate: "bg-slate-400",
  };

  return (
    <div className="relative pl-10 flex flex-col gap-1 transition-all">
      <div className={cn(
        "absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-md z-10",
        colors[color],
        isCurrent && "animate-pulse ring-4 ring-primary/20"
      )} />
      <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{time}</span>
      <h4 className={cn("font-bold text-sm", isCurrent ? "text-primary" : "text-on-surface")}>{title}</h4>
      <p className="text-xs text-on-surface-variant font-medium opacity-70">{description}</p>
    </div>
  );
};
