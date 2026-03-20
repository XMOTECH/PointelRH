import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useEmployees } from './hooks/useEmployees';
import { EmployeeTable } from './components/EmployeeTable';

export function EmployeeListPage() {
  const { data: employees = [], isLoading, error } = useEmployees();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre personnel, les rôles et les accès.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Ajouter
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          Une erreur est survenue lors du chargement des employés.
        </div>
      )}

      {/* Table Section */}
      <EmployeeTable employees={employees} isLoading={isLoading} />
    </div>
  );
}
