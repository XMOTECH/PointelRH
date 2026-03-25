import { Users, MoreHorizontal, Mail, Building2, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import type { Employee } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/utils';
import { useGeneratePin } from '../hooks/useGeneratePin';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
}

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  const generatePin = useGeneratePin();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full bg-surface-container-low animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-on-surface/5">
        <Users size={40} className="mx-auto mb-4 text-on-surface-variant opacity-20" />
        <p className="text-on-surface-variant font-medium">Aucun employé trouvé.</p>
      </div>
    );
  }

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'active': return <Badge variant="success" className="uppercase tracking-tighter text-[9px]">Actif</Badge>;
      case 'on_leave': return <Badge variant="warning" className="uppercase tracking-tighter text-[9px]">En Congé</Badge>;
      case 'inactive': return <Badge variant="error" className="uppercase tracking-tighter text-[9px]">Inactif</Badge>;
      default: return <Badge variant="default" className="uppercase tracking-tighter text-[9px]">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Header labels */}
      <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">
        <div className="col-span-4">Employé</div>
        <div className="col-span-3">Contact</div>
        <div className="col-span-2">Structure</div>
        <div className="col-span-2">Statut</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {employees.map((emp, idx) => (
        <div 
          key={emp.id}
          className={cn(
            "grid grid-cols-12 items-center px-6 py-5 rounded-2xl transition-all duration-200 hover:scale-[1.005] hover:shadow-lg hover:shadow-primary/5 group",
            idx % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low"
          )}
        >
          <div className="col-span-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary font-bold text-lg relative overflow-hidden">
               {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-on-surface leading-snug">{emp.first_name} {emp.last_name}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">
                <ShieldCheck size={10} />
                <span>{emp.role}</span>
              </div>
            </div>
          </div>

          <div className="col-span-3 flex items-center gap-2 text-on-surface-variant opacity-70">
            <Mail size={14} />
            <span className="text-sm font-medium truncate">{emp.email}</span>
          </div>

          <div className="col-span-2 flex items-center gap-2 text-on-surface-variant opacity-70">
            <Building2 size={14} />
            <span className="text-sm font-medium">{emp.department || 'Non assigné'}</span>
          </div>

          <div className="col-span-2">
            {getStatusBadge(emp.status)}
          </div>

          <div className="col-span-1 flex justify-end gap-1">
            <button
              onClick={() => generatePin.mutate(emp.id)}
              disabled={generatePin.isPending}
              title="Envoyer PIN par SMS"
              className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary opacity-60 hover:opacity-100 disabled:opacity-30"
            >
              {generatePin.isPending ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            </button>
            <button className="p-2 hover:bg-surface-container-highest rounded-xl transition-colors text-on-surface-variant opacity-40 hover:opacity-100">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
