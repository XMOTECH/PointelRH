import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import type { UpdateEmployeePayload } from '../types';
import { toast } from 'sonner';

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeePayload }) =>
      employeesApi.updateEmployee(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}
