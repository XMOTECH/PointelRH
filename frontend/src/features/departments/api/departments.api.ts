import api from '../../../lib/axios';
import type { Department } from '../../employees/types';

export const departmentsApi = {
  getDepartments: () =>
    api.get('/api/departments').then(res => {
      const d = res.data.data || res.data;
      return Array.isArray(d) ? d : (d.data || []);
    }),

  getDepartment: (id: string): Promise<Department> =>
    api.get(`/api/departments/${id}`).then(res => res.data?.data ?? res.data),

  createDepartment: (data: Partial<Department>): Promise<Department> =>
    api.post('/api/departments', data).then(res => res.data?.data ?? res.data),

  updateDepartment: (id: string, data: Partial<Department>): Promise<Department> =>
    api.patch(`/api/departments/${id}`, data).then(res => res.data?.data ?? res.data),

  deleteDepartment: (id: string): Promise<void> =>
    api.delete(`/api/departments/${id}`).then(() => undefined),
};
