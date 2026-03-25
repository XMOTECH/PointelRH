import api from '../../../lib/axios';
import type { Employee, CreateEmployeePayload } from '../types';

export const employeesApi = {
  getEmployees: () => 
    api.get('/api/employees').then(res => {
      const d = res.data.data || res.data;
      return Array.isArray(d) ? d : (d.data || []);
    }),
    
  getDepartments: () =>
    api.get('/api/departments').then(res => {
      const d = res.data.data || res.data;
      return Array.isArray(d) ? d : (d.data || []);
    }),
    
  getSchedules: () =>
    api.get('/api/schedules').then(res => {
      const d = res.data.data || res.data;
      return Array.isArray(d) ? d : (d.data || []);
    }),

  /**
   * Orchestre la création d'un Employé ET de son compte Utilisateur (Saga)
   */
  createEmployeeSaga: async (payload: CreateEmployeePayload, companyId: string) => {
    let employeeId: string | null = null;
    try {
      // 1. Créer l'employé dans employee-service
      const empResponse = await api.post('/api/employees', payload);
      const employee = empResponse.data.data as Employee;
      employeeId = employee.id;

      // 2. Créer l'utilisateur dans auth-service
      const authResponse = await api.post('/api/auth/users', {
        email: payload.email,
        name: `${payload.first_name} ${payload.last_name}`,
        role: payload.role || 'employee',
        company_id: companyId,
        employee_id: employeeId,
      });

      return {
        ...employee,
        _temp_password: authResponse.data?.data?.temp_password
      };
    } catch (error) {
      // Compensation (Rollback): Si auth-service échoue, on supprime l'employé
      if (employeeId) {
        try {
          await api.delete(`/api/employees/${employeeId}`);
        } catch (rollbackError) {
          console.error('CRITICAL: Failed to rollback employee creation', rollbackError);
        }
      }
      throw error;
    }
  },
  generatePin: (id: string) =>
    api.post(`/api/employees/${id}/generate-pin`),

  getMyQrToken: (employeeId: string) =>
    api.get(`/api/employees/${employeeId}`).then(res => {
      const d = res.data?.data || res.data;
      return d?.qr_token as string | undefined;
    }),
};
