import api from '../../../lib/axios';
import type { Employee } from '../types';

export const employeesApi = {
  getEmployees: () => 
    api.get('/api/employees').then(res => res.data.data || res.data as Employee[]),
};
