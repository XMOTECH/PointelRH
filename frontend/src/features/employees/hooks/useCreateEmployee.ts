import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import type { CreateEmployeePayload } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => {
      if (!user?.company_id) {
        throw new Error('Company ID missing for current user');
      }
      return employeesApi.createEmployeeSaga(payload, user.company_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé créé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la création de l\'employé');
    },
  });
}
