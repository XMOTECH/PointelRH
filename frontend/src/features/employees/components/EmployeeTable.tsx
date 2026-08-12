import { useState, useRef, useCallback } from 'react';
import { Users, MoreHorizontal, Mail, Building2, Eye, Pencil, Trash2, UserCheck, UserX, UserMinus } from 'lucide-react';
import type { Employee } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onStatusChange: (employee: Employee, status: Employee['status']) => void;
}

function getDeptName(department: Employee['department']): string {
  if (!department) return 'Non assigné';
  if (typeof department === 'string') return department;
  return department.name;
}

function ActionDropdown({ employee, onView, onEdit, onDelete, onStatusChange }: {
  employee: Employee;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Employee['status']) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, useCallback(() => setOpen(false), []));

  const statuses: { value: Employee['status']; label: string; icon: typeof UserCheck }[] = [
    { value: 'active', label: 'Actif', icon: UserCheck },
    { value: 'inactive', label: 'Inactif', icon: UserX },
    { value: 'suspended', label: 'Suspendu', icon: UserMinus },
  ];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface-variant/60 hover:text-on-surface cursor-pointer"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-on-surface/15 py-1 z-50">
          <button
            onClick={() => { onView(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <Eye size={14} /> Détails
          </button>
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <Pencil size={14} /> Modifier
          </button>

          <div className="border-t border-on-surface/10 my-1" />

          {statuses
            .filter(s => s.value !== employee.status)
            .map(s => (
              <button
                key={s.value}
                onClick={() => { onStatusChange(s.value); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <s.icon size={14} /> {s.label}
              </button>
            ))}

          <div className="border-t border-on-surface/10 my-1" />

          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

export function EmployeeTable({ employees, isLoading, onView, onEdit, onDelete, onStatusChange }: EmployeeTableProps) {
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
      <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-on-surface/15 shadow-none">
        <Users size={40} className="mx-auto mb-4 text-on-surface-variant/30" />
        <p className="text-on-surface-variant/70 font-semibold text-sm">Aucun enregistrement trouvé.</p>
      </div>
    );
  }

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'active': return <Badge variant="success" className="uppercase tracking-wider text-[9px] font-bold">Actif</Badge>;
      case 'suspended': return <Badge variant="warning" className="uppercase tracking-wider text-[9px] font-bold">Suspendu</Badge>;
      case 'inactive': return <Badge variant="error" className="uppercase tracking-wider text-[9px] font-bold">Inactif</Badge>;
      default: return <Badge variant="default" className="uppercase tracking-wider text-[9px] font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-on-surface/15 overflow-hidden shadow-none">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-container-low/30 hover:bg-transparent border-b border-on-surface/10">
            <TableHead className="py-4 pl-6 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px]">Employé ↕</TableHead>
            <TableHead className="py-4 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px]">Contact ↕</TableHead>
            <TableHead className="py-4 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px]">Structure ↕</TableHead>
            <TableHead className="py-4 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px]">Statut ↕</TableHead>
            <TableHead className="py-4 pr-6 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id} className="group hover:bg-surface-container-low/50 transition-colors border-b border-on-surface/10 last:border-b-0">
              <TableCell className="py-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-on-surface/15 flex items-center justify-center text-primary font-bold text-sm bg-transparent shrink-0">
                    {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-on-surface">{emp.first_name} {emp.last_name}</span>
                </div>
              </TableCell>

              <TableCell className="py-4 text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="opacity-50 shrink-0" />
                  <span className="text-sm font-medium">{emp.email}</span>
                </div>
              </TableCell>

              <TableCell className="py-4 text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="opacity-50 shrink-0" />
                  <span className="text-sm font-medium">{getDeptName(emp.department)}</span>
                </div>
              </TableCell>

              <TableCell className="py-4">
                {getStatusBadge(emp.status)}
              </TableCell>

              <TableCell className="py-4 pr-6 text-right">
                <ActionDropdown
                  employee={emp}
                  onView={() => onView(emp)}
                  onEdit={() => onEdit(emp)}
                  onDelete={() => onDelete(emp)}
                  onStatusChange={(status) => onStatusChange(emp, status)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
