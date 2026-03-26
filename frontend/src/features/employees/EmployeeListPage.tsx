import { Plus, Users, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useEmployees } from './hooks/useEmployees';
import { useCreateEmployee } from './hooks/useCreateEmployee';
import { useUpdateEmployee } from './hooks/useUpdateEmployee';
import { useDeleteEmployee } from './hooks/useDeleteEmployee';
import { useUpdateEmployeeStatus } from './hooks/useUpdateEmployeeStatus';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { DeleteEmployeeDialog } from './components/DeleteEmployeeDialog';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import type { Employee, CreateEmployeePayload, UpdateEmployeePayload } from './types';
import { motion } from 'framer-motion';

export function EmployeeListPage() {
  const { data: employees = [], isLoading, error } = useEmployees();

  // Modal / dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Mutations
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const statusMutation = useUpdateEmployeeStatus();

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: CreateEmployeePayload | UpdateEmployeePayload) => {
    if (editingEmployee) {
      updateMutation.mutate(
        { id: editingEmployee.id, data: data as UpdateEmployeePayload },
        { onSuccess: () => { setFormOpen(false); setEditingEmployee(null); } },
      );
    } else {
      createMutation.mutate(data as CreateEmployeePayload, {
        onSuccess: () => { setFormOpen(false); },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingEmployee) return;
    deleteMutation.mutate(deletingEmployee.id, {
      onSuccess: () => { setDeletingEmployee(null); },
    });
  };

  const handleStatusChange = (emp: Employee, status: Employee['status']) => {
    statusMutation.mutate({ id: emp.id, status });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Gestion du Personnel</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-on-surface tracking-tight">Annuaire des Employés</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={16} />
             <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
             />
          </div>
          <Button variant="secondary" className="!p-2.5">
             <Filter size={18} />
          </Button>
          <Button className="flex items-center gap-2 whitespace-nowrap" onClick={handleOpenCreate}>
            <Plus size={18} />
            Ajouter un Employé
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-tight">Erreur de synchronisation des données</span>
        </div>
      )}

      {/* Table Section */}
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        onView={(emp) => setViewingEmployee(emp)}
        onEdit={handleOpenEdit}
        onDelete={(emp) => setDeletingEmployee(emp)}
        onStatusChange={handleStatusChange}
      />

      {/* Form Modal (create / edit) */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingEmployee(null); }}
        onSubmit={handleFormSubmit}
        isLoading={editingEmployee ? updateMutation.isPending : createMutation.isPending}
        employee={editingEmployee}
      />

      {/* Delete Dialog */}
      <DeleteEmployeeDialog
        open={!!deletingEmployee}
        employeeName={deletingEmployee ? `${deletingEmployee.first_name} ${deletingEmployee.last_name}` : ''}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Detail Modal */}
      <EmployeeDetailModal
        open={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee}
      />

      <div className="h-10" />
    </motion.div>
  );
}
