import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CalendarRange, Clock, MoreVertical, CalendarDays } from 'lucide-react';
import { schedulesApi } from './api/schedules.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ScheduleForm } from './components/ScheduleForm';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const ScheduleListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: schedulesApi.getSchedules,
  });

  const createMutation = useMutation({
    mutationFn: schedulesApi.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Planning créé avec succès');
      setIsFormOpen(false);
    },
    onError: () => {
      toast.error('Erreur lors de la création du planning');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase italic">
            Plannings
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            Définissez les horaires de travail et les seuils de tolérance.
          </p>
        </div>
        <Button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={20} />
          Nouveau Planning
        </Button>
      </div>

      {/* Grid view for schedules (more visual than table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {schedules?.map((schedule: any) => (
          <Card key={schedule.id} className="premium-card p-6 flex flex-col gap-5 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CalendarRange size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{schedule.name}</h3>
                  <div className="flex items-center gap-1 text-on-surface-variant/60 text-xs font-bold uppercase tracking-widest mt-0.5">
                     <Clock size={12} />
                     <span>{schedule.start_time} - {schedule.end_time}</span>
                  </div>
                </div>
              </div>
              <Button variant="tertiary" size="sm" className="btn-ghost !p-2">
                <MoreVertical size={16} />
              </Button>
            </div>

            {/* Visual Days Indicator */}
            <div className="flex items-center justify-between gap-1 p-2 bg-surface-container-low rounded-lg border border-outline-variant/30">
               {DAYS.map((day, idx) => {
                 const isActive = schedule.work_days?.includes(idx + 1);
                 return (
                   <div 
                    key={day} 
                    className={`flex-1 text-center py-1 rounded text-[10px] font-black uppercase tracking-tighter transition-all ${
                      isActive 
                        ? 'bg-primary text-on-primary shadow-sm scale-105' 
                        : 'text-on-surface-variant/30'
                    }`}
                   >
                     {day}
                   </div>
                 );
               })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Tolérance</span>
                  <span className="text-sm font-bold text-amber-600">+{schedule.grace_minutes || 0} min</span>
               </div>
               <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Utilisation</span>
                  <span className="text-sm font-bold opacity-60">-- employés</span>
               </div>
            </div>

            {/* Hover Action Overlay Overlay Hint */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Card>
        ))}

        {schedules?.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl opacity-40">
             <CalendarDays size={48} className="mb-4" />
             <p className="font-medium italic">Aucun planning défini pour le moment.</p>
          </div>
        )}
      </div>

      <ScheduleForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
