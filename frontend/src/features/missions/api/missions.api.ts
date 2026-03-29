import api from '../../../lib/axios';
import type { Employee } from '../../employees/types';

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string | null;
  department_id: string | null;
  department?: {
    id: string;
    name: string;
  };
  employees?: Employee[];
  created_at: string;
  updated_at: string;
}

export interface CreateMissionDTO {
  title: string;
  description?: string;
  location?: string;
  status?: string;
  start_date: string;
  end_date?: string;
  department_id?: string;
  employee_ids?: string[];
}

export const missionsApi = {
  getMissions: (params?: any) => 
    api.get<{ data: Mission[] }>('/api/missions', { params }),
  
  getMission: (id: string) => 
    api.get<{ data: Mission }>(`/api/missions/${id}`),
  
  createMission: (data: CreateMissionDTO) => 
    api.post<{ data: Mission }>('/api/missions', data),
  
  updateMission: (id: string, data: Partial<CreateMissionDTO>) => 
    api.patch<{ data: Mission }>(`/api/missions/${id}`, data),
  
  assignEmployees: (id: string, employeeIds: string[], comment?: string) => 
    api.post(`/api/missions/${id}/assign`, { employee_ids: employeeIds, comment }),
  
  deleteMission: (id: string) => 
    api.delete(`/api/missions/${id}`),
};
