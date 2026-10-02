import React from 'react';
import { Mail, Building2, Eye, Pencil, Trash2, UserCheck, UserX, UserMinus, UserPlus } from 'lucide-react';
import type { Employee } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { UserAvatarCell } from '../../../components/common/UserAvatarCell';
import { ActionMenu } from '../../../components/common/ActionMenu';
import type { ActionMenuItem } from '../../../components/common/ActionMenu';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onStatusChange: (employee: Employee, status: Employee['status']) => void;
  onCreate?: () => void;
}

function getDeptName(department: Employee['department']): string {
  if (!department) return 'Non assigné';
  if (typeof department === 'string') return department;
  return department.name || 'Non assigné';
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onCreate,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-on-surface/10 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-container-low/50 hover:bg-surface-container-low/50 border-b border-on-surface/10">
            <TableHead className="py-3.5 pl-6 font-semibold text-on-surface-variant text-xs">
              Collaborateur
            </TableHead>
            <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">
              Contact
            </TableHead>
            <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">
              Département
            </TableHead>
            <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">
              Statut
            </TableHead>
            <TableHead className="py-3.5 pr-6 font-semibold text-on-surface-variant text-xs text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <Skeleton.TableRow columns={5} rows={5} />
          ) : !employees?.length ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8">
                <EmptyState
                  title="Aucun collaborateur trouvé"
                  description="Aucun employé ne correspond aux critères de recherche actuels."
                  action={
                    onCreate
                      ? {
                          label: 'Ajouter un collaborateur',
                          onClick: onCreate,
                          icon: UserPlus,
                        }
                      : undefined
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => {
              const actions: ActionMenuItem[] = [
                {
                  label: 'Voir la fiche',
                  icon: Eye,
                  onClick: () => onView(emp),
                },
                {
                  label: 'Modifier',
                  icon: Pencil,
                  onClick: () => onEdit(emp),
                },
                {
                  divider: true,
                  label: 'Passer en Actif',
                  icon: UserCheck,
                  disabled: emp.status === 'active',
                  onClick: () => onStatusChange(emp, 'active'),
                },
                {
                  label: 'Suspendre',
                  icon: UserMinus,
                  disabled: emp.status === 'suspended',
                  onClick: () => onStatusChange(emp, 'suspended'),
                },
                {
                  label: 'Désactiver',
                  icon: UserX,
                  disabled: emp.status === 'inactive',
                  onClick: () => onStatusChange(emp, 'inactive'),
                },
                {
                  divider: true,
                  label: 'Supprimer',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: () => onDelete(emp),
                },
              ];

              return (
                <TableRow
                  key={emp.id}
                  className="group hover:bg-surface-container-low/40 transition-colors border-b border-on-surface/5 last:border-b-0"
                >
                  {/* Collaborateur (Avatar + Nom + Poste) */}
                  <TableCell className="py-3.5 pl-6">
                    <UserAvatarCell
                      firstName={emp.first_name}
                      lastName={emp.last_name}
                      subtitle={emp.position || 'Collaborateur'}
                      onClick={() => onView(emp)}
                    />
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="py-3.5 text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="opacity-50 shrink-0 text-on-surface-variant" />
                      <span className="text-xs sm:text-sm font-medium">{emp.email}</span>
                    </div>
                  </TableCell>

                  {/* Département */}
                  <TableCell className="py-3.5 text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="opacity-50 shrink-0 text-on-surface-variant" />
                      <span className="text-xs sm:text-sm font-medium">{getDeptName(emp.department)}</span>
                    </div>
                  </TableCell>

                  {/* Statut (nettoyage automatique des tirets du bas) */}
                  <TableCell className="py-3.5">
                    <StatusBadge status={emp.status} />
                  </TableCell>

                  {/* Actions contextuelles */}
                  <TableCell className="py-3.5 pr-6 text-right">
                    <ActionMenu items={actions} align="right" />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
