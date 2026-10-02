import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Search, Users, ShieldCheck, Edit2, Trash2 } from 'lucide-react';
import { departmentsApi } from './api/departments.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DepartmentForm } from './components/DepartmentForm';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useEmployees } from '../employees/hooks/useEmployees';

export const DepartmentListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDepartment, setEditingDepartment] = React.useState<any>(null);
  const [departmentToDelete, setDepartmentToDelete] = React.useState<string | null>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  const { data: employees } = useEmployees();
  const totalEmployees = employees?.length ?? 0;
  const managedCount = departments?.filter((d: any) => {
    if (d.manager_name || d.manager_id) return true;
    return employees?.some((emp: any) => {
      const isManager = emp.role === 'manager' || emp.role === 'admin';
      const empDeptId = emp.department_id || (typeof emp.department === 'object' ? emp.department?.id : null);
      const empDeptName = typeof emp.department === 'string' ? emp.department : emp.department?.name;
      return isManager && (empDeptId === d.id || empDeptName === d.name);
    });
  })?.length || 0;

  const createMutation = useMutation({
    mutationFn: departmentsApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département créé avec succès');
      setIsFormOpen(false);
    },
    onError: () => {
      toast.error('Erreur lors de la création du département');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentsApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département mis à jour avec succès');
      setIsFormOpen(false);
      setEditingDepartment(null);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: departmentsApi.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleEdit = (dept: any) => {
    const foundManager = employees?.find((emp: any) => {
      const empDeptId = emp.department_id || (typeof emp.department === 'object' ? emp.department?.id : null);
      const empDeptName = typeof emp.department === 'string' ? emp.department : emp.department?.name;
      return (emp.role === 'manager' || emp.role === 'admin') && (empDeptId === dept.id || empDeptName === dept.name);
    });
    setEditingDepartment({
      ...dept,
      manager_id: foundManager?.id || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDepartmentToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (departmentToDelete) {
      deleteMutation.mutate(departmentToDelete, {
        onSettled: () => setDepartmentToDelete(null),
      });
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase">
            Départements
          </h1>
        </div>
        <Button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={20} />
          Nouveau Département
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl p-6 shadow-none flex items-center gap-4">
          <Building2 size={24} className="text-primary shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-[0.2em] block mb-1">Total Départements</span>
            <span className="text-3xl font-mono tabular-nums font-extrabold text-on-surface">{departments?.length || 0}</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl p-6 shadow-none flex items-center gap-4">
          <Users size={24} className="text-emerald-600 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-[0.2em] block mb-1">Total Employés</span>
            <span className="text-3xl font-mono tabular-nums font-extrabold text-on-surface">{totalEmployees}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl p-6 shadow-none flex items-center gap-4">
          <ShieldCheck size={24} className="text-amber-600 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-[0.2em] block mb-1">Managers Assignés</span>
            <span className="text-3xl font-mono tabular-nums font-extrabold text-on-surface">{managedCount} / {departments?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Card className="premium-card overflow-hidden">
        <div className="card-header bg-surface-container-low/50">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/30 hover:bg-transparent border-b border-on-surface/10">
              <TableHead className="py-4 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px]">Nom du Département ↕</TableHead>
              <TableHead className="py-4 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px]">Effectif ↕</TableHead>
              <TableHead className="py-4 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px]">Manager / Responsable ↕</TableHead>
              <TableHead className="py-4 font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments?.map((dept: any) => {
              const empCount = employees?.filter((emp: any) => {
                const empDeptId = emp.department_id || (typeof emp.department === 'object' ? emp.department?.id : null);
                const empDeptName = typeof emp.department === 'string' ? emp.department : emp.department?.name;
                return empDeptId === dept.id || empDeptName === dept.name;
              })?.length || 0;

              const foundManager = employees?.find((emp: any) => {
                const isManager = emp.role === 'manager' || emp.role === 'admin';
                const empDeptId = emp.department_id || (typeof emp.department === 'object' ? emp.department?.id : null);
                const empDeptName = typeof emp.department === 'string' ? emp.department : emp.department?.name;
                return isManager && (empDeptId === dept.id || empDeptName === dept.name);
              });

              const managerName = dept.manager_name || (foundManager ? `${foundManager.first_name || ''} ${foundManager.last_name || ''}`.trim() : null);

              return (
                <TableRow key={dept.id} className="group hover:bg-surface-container-low/50 transition-colors border-b border-on-surface/10 last:border-0">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Building2 size={20} className="text-primary shrink-0" />
                      <span className="font-semibold text-on-surface">{dept.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-on-surface-variant/50 shrink-0" />
                      <span className="text-sm font-semibold text-on-surface font-mono">
                        {empCount} {empCount > 1 ? 'employés' : 'employé'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      {managerName ? (
                        <>
                          <div className="w-6 h-6 rounded-full border border-on-surface/15 flex items-center justify-center text-[10px] font-bold text-primary bg-transparent shrink-0">
                            {managerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-on-surface">{managerName}</span>
                        </>
                      ) : (
                        <span className="text-xs text-on-surface-variant/60 font-medium">Non défini</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2 pr-4">
                      <Button 
                        variant="tertiary" 
                        size="sm" 
                        className="btn-ghost !p-2 text-primary hover:bg-primary/5"
                        onClick={() => handleEdit(dept)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="tertiary" 
                        size="sm" 
                        className="btn-ghost !p-2 text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {departments?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-on-surface-variant opacity-60 italic">
                  Aucun département trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <DepartmentForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDepartment(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingDepartment}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!departmentToDelete}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le département"
        description="Êtes-vous sûr de vouloir supprimer ce département ? Cette action est irréversible et peut impacter les employés qui y sont rattachés."
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
