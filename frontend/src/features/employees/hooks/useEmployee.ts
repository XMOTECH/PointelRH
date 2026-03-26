import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import type { Employee } from '../types';

export function useEmployee(id: string | null) {
  return useQuery<Employee, Error>({
    queryKey: ['employees', id],
    queryFn: () => employeesApi.getEmployee(id!),
    enabled: !!id,
  });
}
