import { useState, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Mutations
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const statusMutation = useUpdateEmployeeStatus();

  // Client-side filtering
  const filteredEmployees = employees.filter((emp: Employee) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const deptObj = emp.department;
    const deptName = typeof deptObj === 'string' ? deptObj : (deptObj?.name || '');
    const deptId = typeof deptObj === 'string' ? '' : (deptObj?.id || '');

    const matchesSearch =
      fullName.includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      deptName.toLowerCase().includes(searchLower);

    const matchesDept = selectedDept === 'all' || deptId === selectedDept || deptName === selectedDept;

    return matchesSearch && matchesDept;
  });

  // Unique departments for selector
  const departmentOptions = useMemo(() => {
    const depts = new Map<string, string>();
    employees.forEach((emp) => {
      const dept = emp.department;
      if (dept && typeof dept !== 'string') {
        depts.set(dept.id, dept.name);
      }
    });
    return [
      { value: 'all', label: 'Tous les départements' },
      ...Array.from(depts.entries()).map(([id, name]) => ({ value: id, label: name })),
    ];
  }, [employees]);

  // Handlers
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
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingEmployee(null);
          },
        }
      );
    } else {
      createMutation.mutate(data as CreateEmployeePayload, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingEmployee) return;
    deleteMutation.mutate(deletingEmployee.id, {
      onSuccess: () => {
        setDeletingEmployee(null);
      },
    });
  };

  const handleStatusChange = (emp: Employee, status: Employee['status']) => {
    statusMutation.mutate({ id: emp.id, status });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* En-tête de page standardisé */}
      <PageHeader
        title="Gestion des Collaborateurs"
        subtitle="Consultez, ajoutez et gérez les effectifs, départements et affectations de l'entreprise."
        actions={
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus size={18} />
            <span>Nouveau Collaborateur</span>
          </Button>
        }
      >
        {/* Barre d'outils de filtrage */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom, email..."
              shortcut="/"
            />
          </div>
          <div className="w-full sm:w-60">
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={departmentOptions}
            />
          </div>
        </div>
      </PageHeader>

      {/* Alerte d'erreur de synchronisation */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200/80 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          <span className="text-xs font-semibold">
            Erreur lors de la récupération des données collaborateurs.
          </span>
        </div>
      )}

      {/* Table Section */}
      <EmployeeTable
        employees={filteredEmployees}
        isLoading={isLoading}
        onView={(emp) => setViewingEmployee(emp)}
        onEdit={handleOpenEdit}
        onDelete={(emp) => setDeletingEmployee(emp)}
        onStatusChange={handleStatusChange}
        onCreate={handleOpenCreate}
      />

      {/* Form Modal (create / edit) */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={editingEmployee ? updateMutation.isPending : createMutation.isPending}
        employee={editingEmployee}
      />

      {/* Delete Dialog */}
      <DeleteEmployeeDialog
        open={!!deletingEmployee}
        employeeName={
          deletingEmployee
            ? `${deletingEmployee.first_name} ${deletingEmployee.last_name}`
            : ''
        }
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
    </motion.div>
  );
}
