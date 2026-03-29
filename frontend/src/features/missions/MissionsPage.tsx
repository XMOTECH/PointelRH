import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Calendar, 
  Search,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';
import { missionsApi } from './api/missions.api';
import type { Mission } from './api/missions.api';
import { MissionForm } from './components/MissionForm';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const MissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const response = await missionsApi.getMissions();
      setMissions(response.data.data);
    } catch (error) {
      console.error('Failed to load missions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMissions = missions.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Mission['status']) => {
    const baseClass = "status-badge";
    switch (status) {
      case 'active':
        return <span className={cn(baseClass, "bg-blue-100/50 text-blue-700 border border-blue-200")}>En cours</span>;
      case 'completed':
        return <span className={cn(baseClass, "bg-emerald-100/50 text-emerald-700 border border-emerald-200")}>Terminée</span>;
      case 'cancelled':
        return <span className={cn(baseClass, "bg-rose-100/50 text-rose-700 border border-rose-200")}>Annulée</span>;
      default:
        return <span className={cn(baseClass, "bg-slate-100/50 text-slate-700 border border-slate-200")}>Brouillon</span>;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-surface">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-space font-bold text-on-surface tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            Missions
          </h1>
          <p className="text-on-surface-variant font-medium ml-1">
            {user?.role === 'manager' 
              ? `Gestion des affectations pour ${user?.department_id || 'votre département'}`
              : "Suivi global des interventions et missions"
            }
          </p>
        </div>
        
        <Button 
          className="btn-primary group shadow-lg shadow-primary/20"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Nouvelle Mission
        </Button>
      </div>

      {/* Stats Quick View (Premium Detail) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{missions.length}</div>
            <div className="text-xs text-on-surface-variant font-medium">Total Missions</div>
          </div>
        </div>
        <div className="glass p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{missions.filter(m => m.status === 'completed').length}</div>
            <div className="text-xs text-on-surface-variant font-medium">Réussies</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Rechercher une mission, un lieu, une équipe..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" className="btn-secondary w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Filtrer
          </Button>
        </div>
      </div>

      {/* Ghost Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl animate-pulse bg-surface-container-low" />
          ))}
        </div>
      ) : filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredMissions.map((mission) => (
            <div key={mission.id} className="premium-card accent-bar relative overflow-hidden group">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-space font-bold text-on-surface group-hover:text-primary transition-colors">
                      {mission.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                      <MapPin className="w-3.5 h-3.5" />
                      {mission.location || 'Site non spécifié'}
                    </div>
                  </div>
                  {getStatusBadge(mission.status)}
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 italic font-medium">
                  {mission.description || 'Action planifiée sans détails supplémentaires.'}
                </p>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Début</span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
                      <Clock className="w-4 h-4 text-primary" />
                      {format(new Date(mission.start_date), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold text-right">Affectés</span>
                    <div className="flex -space-x-3">
                      {(mission.employees || []).slice(0, 3).map(emp => (
                        <div key={emp.id} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary ring-1 ring-primary/5">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                      ))}
                      {mission.employees && mission.employees.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary border-2 border-white flex items-center justify-center text-[10px] font-bold">
                          +{mission.employees.length - 3}
                        </div>
                      )}
                      {(!mission.employees || mission.employees.length === 0) && (
                         <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                          ?
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="tertiary" className="btn-ghost flex-1 text-xs">
                    Modifier
                  </Button>
                  <Button className="btn-primary w-12 h-10 p-0 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 p-1">
                <div className="w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-3xl border-dashed">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-on-surface-variant opacity-20" />
          </div>
          <h2 className="text-2xl font-space font-bold text-on-surface mb-2">Aucune mission en vue</h2>
          <p className="text-on-surface-variant max-w-sm text-center mb-8 font-medium">
            Le calendrier est vide. Commencez par définir une nouvelle mission pour mobiliser vos équipes sur le terrain.
          </p>
          <Button className="btn-primary px-8" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-5 h-5" />
            Créer ma première mission
          </Button>
        </div>
      )}

      {/* Mission Creation Form */}
      <MissionForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadMissions}
      />
    </div>
  );
};
