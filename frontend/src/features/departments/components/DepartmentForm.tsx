import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../../employees/api/employees.api';

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  manager_id: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

export const DepartmentForm: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ name: '', manager_id: '' });
    }
  }, [initialData, reset, isOpen]);

  const { data: employees } = useQuery({
    queryKey: ['employees', 'managers'],
    queryFn: () => employeesApi.getEmployees({ role: 'manager' }),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-premium border border-outline-variant overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Building2 size={20} />
            </div>
            <h2 className="text-lg font-bold">
              {initialData ? 'Modifier le Département' : 'Nouveau Département'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Nom du département</label>
            <Input 
              {...register('name')}
              placeholder="Ex: Direction Financière, Technique..."
              className={errors.name ? 'border-red-500' : ''}
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Manager Responsable</label>
            <select
              {...register('manager_id')}
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Aucun manager --</option>
              {employees?.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
            <Button type="button" variant="tertiary" onClick={onClose} className="btn-ghost">
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading} className="btn-primary min-w-[120px]">
              Créer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
