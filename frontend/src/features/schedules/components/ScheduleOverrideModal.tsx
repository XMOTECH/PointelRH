import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const schema = z.object({
  is_off: z.boolean(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  reason: z.string().max(255).optional(),
}).refine((data) => {
  if (!data.is_off) {
    return !!data.start_time && !!data.end_time;
  }
  return true;
}, {
  message: "Les horaires sont requis si l'employé n'est pas en repos",
  path: ["start_time"],
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  employeeName: string;
  date: Date;
  initialData?: Partial<FormData>;
}

export const ScheduleOverrideModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  employeeName, 
  date,
  initialData 
}) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_off: initialData?.is_off ?? false,
      start_time: initialData?.start_time ?? '08:00',
      end_time: initialData?.end_time ?? '17:00',
      reason: initialData?.reason ?? '',
    }
  });

  const isOff = watch('is_off');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-premium border border-outline-variant overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Modification Exceptionnelle</h2>
            <p className="text-xs text-on-surface-variant font-medium">
              {employeeName} • {format(date, 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface">Jour de repos</span>
              <span className="text-[10px] text-on-surface-variant font-medium">Marquer l'employé comme absent</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('is_off')} className="sr-only peer" />
              <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {!isOff && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Début</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={14} />
                  <Input 
                    {...register('start_time')}
                    type="time"
                    className={`pl-10 ${errors.start_time ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Fin</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={14} />
                  <Input 
                    {...register('end_time')}
                    type="time"
                    className={`pl-10 ${errors.end_time ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Motif (Optionnel)</label>
            <Input 
              {...register('reason')}
              placeholder="Ex: Remplacement, Formation..."
            />
          </div>

          {errors.start_time && (
             <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 italic text-xs font-medium">
                <AlertCircle size={14} />
                <span>{errors.start_time.message}</span>
             </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant">
            <Button type="button" variant="tertiary" onClick={onClose} className="btn-ghost">
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading} className="btn-primary min-w-[140px]">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
