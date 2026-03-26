import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { toast } from 'sonner';

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.deleteEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
}
