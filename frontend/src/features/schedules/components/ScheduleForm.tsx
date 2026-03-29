import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, CalendarRange, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm requis"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm requis"),
  grace_minutes: z.preprocess((val) => Number(val), z.number().min(0).max(60)),
  work_days: z.array(z.number()).min(1, "Sélectionnez au moins un jour"),
}) satisfies z.ZodType<any>;

type FormData = {
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  work_days: number[];
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
  { label: 'Dim', value: 7 },
];

export const ScheduleForm: React.FC<Props> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      work_days: [1, 2, 3, 4, 5],
      grace_minutes: 15,
      start_time: '08:00',
      end_time: '17:00',
    }
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-premium border border-outline-variant overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <CalendarRange size={20} />
            </div>
            <h2 className="text-lg font-bold">Nouveau Planning</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nom du planning</label>
            <Input 
              {...register('name')}
              placeholder="Ex: Horaire Standard, Équipe de Nuit..."
              className={errors.name ? 'border-red-500' : ''}
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Heure de début</label>
              <Input 
                {...register('start_time')}
                type="time"
                className={errors.start_time ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Heure de fin</label>
              <Input 
                {...register('end_time')}
                type="time"
                className={errors.end_time ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Jours travaillés</label>
            <Controller
              name="work_days"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-1 p-2 bg-surface-container-low rounded-xl border border-outline-variant/50">
                  {DAYS.map((day) => {
                    const isSelected = field.value.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const newValue = isSelected
                            ? field.value.filter(v => v !== day.value)
                            : [...field.value, day.value].sort();
                          field.onChange(newValue);
                        }}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${
                          isSelected 
                            ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' 
                            : 'hover:bg-surface-container text-on-surface-variant/40'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.work_days && <p className="text-xs text-red-500 font-medium ml-1">{errors.work_days.message}</p>}
          </div>

          <div className="space-y-1.5 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
               <Info size={16} />
               <label className="text-[10px] font-black uppercase tracking-widest">Tolérance de retard</label>
            </div>
            <div className="flex items-center gap-3">
               <Input 
                 {...register('grace_minutes')}
                 type="number"
                 className="w-24 bg-white border-amber-300 focus:ring-amber-500/20 focus:border-amber-500"
               />
               <span className="text-sm font-bold text-amber-800">minutes</span>
            </div>
            <p className="text-[10px] text-amber-700/60 font-medium mt-1">
              Les employés pointant après {`{Heure de début}`} + {`{Tolérance}`} seront marqués comme étant en retard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant">
            <Button type="button" variant="tertiary" onClick={onClose} className="btn-ghost">
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading} className="btn-primary min-w-[140px]">
              Créer le planning
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
