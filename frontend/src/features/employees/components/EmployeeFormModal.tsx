import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/ui/Button';
import { employeesApi } from '../api/employees.api';
import type { Employee } from '../types';

const schema = z.object({
  first_name: z.string().min(1, 'Prénom requis').max(255),
  last_name: z.string().min(1, 'Nom requis').max(255),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'employee']),
  contract_type: z.enum(['cdi', 'cdd', 'freelance', 'intern']),
  hire_date: z.string().min(1, 'Date requise'),
  department_id: z.string().min(1, 'Département requis'),
  schedule_id: z.string().min(1, 'Horaire requis'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  employee?: Employee | null;
}

export function EmployeeFormModal({ open, onClose, onSubmit, isLoading, employee }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'employee',
      contract_type: 'cdi',
      hire_date: '',
      department_id: '',
      schedule_id: '',
    },
  });

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: employeesApi.getDepartments, enabled: open });
  const { data: schedules = [] } = useQuery({ queryKey: ['schedules'], queryFn: employeesApi.getSchedules, enabled: open });

  useEffect(() => {
    if (employee) {
      reset({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || '',
        role: employee.role === 'super_admin' ? 'admin' : employee.role,
        contract_type: employee.contract_type || 'cdi',
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0].split(' ')[0] : '',
        department_id: employee.department_id || '',
        schedule_id: employee.schedule_id || '',
      });
    } else {
      reset({ first_name: '', last_name: '', email: '', phone: '', role: 'employee', contract_type: 'cdi', hire_date: '', department_id: '', schedule_id: '' });
    }
  }, [employee, reset, open]);

  if (!open) return null;

  const isEdit = !!employee;

  const inputClass = 'w-full h-10 px-3 rounded-lg bg-surface-container-low border border-on-surface/10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';
  const selectClass = inputClass;
  const labelClass = 'block text-xs font-bold text-on-surface-variant mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-on-surface/5 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/5">
          <h2 className="text-lg font-display font-bold text-on-surface">
            {isEdit ? 'Modifier l\'employé' : 'Ajouter un employé'}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label className={labelClass}>Prénom</label>
              <input {...register('first_name')} className={inputClass} placeholder="Jean" />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
            </div>

            {/* Nom */}
            <div>
              <label className={labelClass}>Nom</label>
              <input {...register('last_name')} className={inputClass} placeholder="Dupont" />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email</label>
              <input {...register('email')} type="email" className={inputClass} placeholder="jean@exemple.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className={labelClass}>Téléphone</label>
              <input {...register('phone')} className={inputClass} placeholder="+212 6..." />
            </div>

            {/* Rôle */}
            <div>
              <label className={labelClass}>Rôle</label>
              <select {...register('role')} className={selectClass}>
                <option value="employee">Employe</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            {/* Type de contrat */}
            <div>
              <label className={labelClass}>Type de contrat</label>
              <select {...register('contract_type')} className={selectClass}>
                <option value="cdi">CDI</option>
                <option value="cdd">CDD</option>
                <option value="freelance">Freelance</option>
                <option value="intern">Stagiaire</option>
              </select>
            </div>

            {/* Date d'embauche */}
            <div>
              <label className={labelClass}>Date d'embauche</label>
              <input {...register('hire_date')} type="date" className={inputClass} />
              {errors.hire_date && <p className="text-xs text-red-500 mt-1">{errors.hire_date.message}</p>}
            </div>

            {/* Département */}
            <div>
              <label className={labelClass}>Département</label>
              <select {...register('department_id')} className={selectClass}>
                <option value="">Sélectionner...</option>
                {departments.map((dept: { id: string; name: string }) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.department_id && <p className="text-xs text-red-500 mt-1">{errors.department_id.message}</p>}
            </div>

            {/* Horaire */}
            <div>
              <label className={labelClass}>Horaire</label>
              <select {...register('schedule_id')} className={selectClass}>
                <option value="">Sélectionner...</option>
                {schedules.map((sch: { id: string; name: string; start_time: string }) => (
                  <option key={sch.id} value={sch.id}>{sch.name} ({sch.start_time})</option>
                ))}
              </select>
              {errors.schedule_id && <p className="text-xs text-red-500 mt-1">{errors.schedule_id.message}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Enregistrer' : 'Créer Employé & Accès'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
