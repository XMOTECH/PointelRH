import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import type { CreateEmployeePayload } from '../types';
import { useAuth } from '../../../context/AuthContext';

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => {
      // S'assurer que le user courant a bien une company_id (normalement géré par le AuthContext)
      if (!user?.company_id) {
        throw new Error('Company ID missing for current user');
      }
      return employeesApi.createEmployeeSaga(payload, user.company_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
