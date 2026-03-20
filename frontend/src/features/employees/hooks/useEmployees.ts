import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import type { Employee } from '../types';

export function useEmployees() {
  return useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: employeesApi.getEmployees,
  });
}
