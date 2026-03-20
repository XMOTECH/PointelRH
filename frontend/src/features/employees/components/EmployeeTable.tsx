import type { Employee } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
}

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement des employés...</div>;
  }

  if (!employees?.length) {
    return <div className="p-8 text-center text-gray-500">Aucun employé trouvé.</div>;
  }

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'active': return <Badge variant="success">Actif</Badge>;
      case 'on_leave': return <Badge variant="warning">En Congé</Badge>;
      case 'inactive': return <Badge variant="error">Inactif</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employé</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Département</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</TableCell>
              <TableCell className="text-gray-500">{emp.email}</TableCell>
              <TableCell>{emp.department || 'N/A'}</TableCell>
              <TableCell className="capitalize">{emp.role}</TableCell>
              <TableCell>{getStatusBadge(emp.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
