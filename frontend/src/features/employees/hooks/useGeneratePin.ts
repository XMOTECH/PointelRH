import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { toast } from 'sonner';

export function useGeneratePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => employeesApi.generatePin(employeeId),
    onSuccess: (res: any) => {
      const pinCode = res?.data?.data?.pinCode || res?.data?.data?.pin_code;
      if (pinCode) {
        toast.success(`Nouveau code PIN généré : ${pinCode} (Envoyé par email)`, { duration: 10000 });
      } else {
        toast.success('Code PIN généré et envoyé par email');
      }
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => {
      toast.error('Impossible de générer le code PIN');
    },
  });
}
