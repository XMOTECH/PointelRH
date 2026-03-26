import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import type { Employee } from '../types';
import { toast } from 'sonner';

export function useUpdateEmployeeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Employee['status'] }) =>
      employeesApi.updateEmployeeStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Statut mis à jour');
    },
    onError: () => toast.error('Erreur lors du changement de statut'),
  });
}
