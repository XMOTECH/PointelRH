import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useEmployees } from '../employees/hooks/useEmployees';
import { useCreateEmployee } from '../employees/hooks/useCreateEmployee';
import { useUpdateEmployee } from '../employees/hooks/useUpdateEmployee';
import { useDeleteEmployee } from '../employees/hooks/useDeleteEmployee';
import { useUpdateEmployeeStatus } from '../employees/hooks/useUpdateEmployeeStatus';
import { EmployeeTable } from '../employees/components/EmployeeTable';
import { EmployeeFormModal } from '../employees/components/EmployeeFormModal';
import { DeleteEmployeeDialog } from '../employees/components/DeleteEmployeeDialog';
import { EmployeeDetailModal } from '../employees/components/EmployeeDetailModal';
import type { Employee, CreateEmployeePayload, UpdateEmployeePayload } from '../employees/types';
import { motion } from 'framer-motion';

export function ManagerListPage() {
  // Use specialized hook with manager filter
  const { data: managers = [], isLoading, error } = useEmployees({ role: 'manager' });

  // Modal / dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Employee | null>(null);
  const [deletingManager, setDeletingManager] = useState<Employee | null>(null);
  const [viewingManager, setViewingManager] = useState<Employee | null>(null);

  // Mutations
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const statusMutation = useUpdateEmployeeStatus();

  // Filtered managers
  const filteredManagers = managers;

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingManager(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingManager(emp);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    // Force role 'manager' on creation if not present
    const payload = { ...data, role: 'manager' };

    if (editingManager) {
      updateMutation.mutate(
        { id: editingManager.id, data: payload as UpdateEmployeePayload },
        { onSuccess: () => { setFormOpen(false); setEditingManager(null); } },
      );
    } else {
      createMutation.mutate(payload as CreateEmployeePayload, {
        onSuccess: () => { setFormOpen(false); },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingManager) return;
    deleteMutation.mutate(deletingManager.id, {
      onSuccess: () => { setDeletingManager(null); },
    });
  };

  const handleStatusChange = (emp: Employee, status: Employee['status']) => {
    statusMutation.mutate({ id: emp.id, status });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase">
            Managers
          </h1>
        </div>

        <Button className="flex items-center gap-2 whitespace-nowrap bg-primary text-on-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Nouveau Manager
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-tight">Erreur de chargement des managers</span>
        </div>
      )}

      {/* Table Section */}
      <EmployeeTable
        employees={filteredManagers}
        isLoading={isLoading}
        onView={(emp) => setViewingManager(emp)}
        onEdit={handleOpenEdit}
        onDelete={(emp) => setDeletingManager(emp)}
        onStatusChange={handleStatusChange}
      />

      {/* Form Modal (create / edit) */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingManager(null); }}
        onSubmit={handleFormSubmit}
        isLoading={editingManager ? updateMutation.isPending : createMutation.isPending}
        employee={editingManager}
      />

      {/* Delete Dialog */}
      <DeleteEmployeeDialog
        open={!!deletingManager}
        employeeName={deletingManager ? `${deletingManager.first_name} ${deletingManager.last_name}` : ''}
        onClose={() => setDeletingManager(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Detail Modal */}
      <EmployeeDetailModal
        open={!!viewingManager}
        onClose={() => setViewingManager(null)}
        employee={viewingManager}
      />

      <div className="h-10" />
    </motion.div>
  );
}
