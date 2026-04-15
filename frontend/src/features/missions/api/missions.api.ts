import api from '../../../lib/axios';
import type { Employee } from '../../employees/types';

export interface MissionDocument {
  id: string;
  file_name: string;
  file_type: 'image' | 'pdf' | 'video' | 'document';
  file_size: number;
  url: string;
  uploaded_by_name: string | null;
  created_at: string;
}

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
  documents?: MissionDocument[];
  stats?: {
    total_tasks: number;
    completed_tasks: number;
    progression_percentage: number;
  };
  activity_log?: Array<{
    time: string;
    datetime: string;
    title: string;
    description: string;
    color: string;
  }>;
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

export interface MyMission {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string | null;
  department: string | null;
  assignment_status: 'assigned' | 'seen' | 'completed';
  comment: string | null;
  assigned_at: string;
  stats?: {
    total_tasks: number;
    completed_tasks: number;
    progression_percentage: number;
  };
}

export interface MyMissionCoworker {
  id: string;
  first_name: string;
  last_name: string;
  role: string | null;
}

export interface MyMissionTask {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number;
  completed_at: string | null;
  creator_name: string | null;
  comments: Array<{
    id: string;
    content: string;
    employee_name: string | null;
    attachments: Array<{
      id: string;
      file_name: string;
      file_type: 'image' | 'pdf' | 'video' | 'document';
      file_size: number;
      url: string;
    }>;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MyMissionDetail {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string | null;
  department: { id: string; name: string } | null;
  stats: {
    total_tasks: number;
    completed_tasks: number;
    progression_percentage: number;
    my_tasks_total: number;
    my_tasks_completed: number;
  };
  my_tasks: MyMissionTask[];
  documents: MissionDocument[];
  coworkers: MyMissionCoworker[];
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  status: string;
  status_label: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  late_minutes: number;
  work_minutes: number;
  channel: string;
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

  getMyMissions: () =>
    api.get<{ data: MyMission[] }>('/api/employee/my-missions'),

  getMyMission: (id: string) =>
    api.get<{ data: MyMissionDetail }>(`/api/employee/my-missions/${id}`),

  // Documents
  uploadDocuments: (missionId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('documents[]', f));
    return api.post<{ data: MissionDocument[] }>(`/api/missions/${missionId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteDocument: (missionId: string, docId: string) =>
    api.delete(`/api/missions/${missionId}/documents/${docId}`),

  // Attendance (cross-service via Kong)
  getAttendanceByEmployees: (employeeIds: string[], date?: string) =>
    api.get<{ data: AttendanceRecord[] }>('/api/pointage/attendances/by-employees', {
      params: { ids: employeeIds.join(','), date },
    }),

  reportIncident: (data: { mission_id?: string; title: string; description: string; severity: string }) =>
    api.post('/api/incidents', data),

  getIncidents: (params?: { mission_id?: string }) =>
    api.get('/api/incidents', { params }),
};
