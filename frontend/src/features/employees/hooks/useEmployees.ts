import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import type { Employee } from '../types';

export function useEmployees(filters?: any) {
  return useQuery<Employee[], Error>({
    queryKey: ['employees', filters],
    queryFn: () => employeesApi.getEmployees(filters),
  });
}
