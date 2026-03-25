import { useMutation } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { toast } from 'sonner';

export function useGeneratePin() {
  return useMutation({
    mutationFn: (employeeId: string) => employeesApi.generatePin(employeeId),
    onSuccess: () => {
      toast.success('Code PIN généré et envoyé par email');
    },
    onError: () => {
      toast.error('Impossible de générer le code PIN');
    },
  });
}
