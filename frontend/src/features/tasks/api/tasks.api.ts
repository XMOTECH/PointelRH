import api from '../../../lib/axios';

export interface TaskAttachment {
  id: string;
  file_name: string;
  file_type: 'image' | 'pdf' | 'video' | 'document';
  file_size: number;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  recurrence: 'daily' | 'weekly' | null;
  estimated_minutes: number | null;
  actual_minutes: number;
  completed_at: string | null;
  assigned_to: string;
  assignee_name: string | null;
  created_by: string;
  creator_name: string | null;
  department_id: string | null;
  mission_id: string | null;
  mission_title: string | null;
  comments: TaskComment[];
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  content: string;
  employee_name: string | null;
  attachment_path: string | null;
  attachments: TaskAttachment[];
  created_at: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assigned_to: string;
  mission_id?: string;
  due_date?: string;
  recurrence?: 'daily' | 'weekly';
  estimated_minutes?: number;
}

export interface CreateMyTaskDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  estimated_minutes?: number;
}

export interface UpdateMyTaskDTO {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: Task['status'];
  due_date?: string;
  estimated_minutes?: number;
}

export const tasksApi = {
  // Employee endpoints
  getMyTasks: (params?: Record<string, string>) =>
    api.get<{ data: Task[] }>('/api/employee/my-tasks', { params }),

  updateMyTaskStatus: (id: string, status: Task['status']) =>
    api.patch<{ data: Task }>(`/api/employee/my-tasks/${id}/status`, { status }),

  logTime: (id: string, minutes: number) =>
    api.post<{ data: { actual_minutes: number } }>(`/api/employee/my-tasks/${id}/timer`, { minutes }),

  createMyTask: (missionId: string, data: CreateMyTaskDTO) =>
    api.post<{ data: Task }>(`/api/employee/my-missions/${missionId}/tasks`, data),

  updateMyTask: (id: string, data: UpdateMyTaskDTO) =>
    api.patch<{ data: Task }>(`/api/employee/my-tasks/${id}`, data),

  addMyComment: (taskId: string, content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    if (attachments?.length) {
      attachments.forEach(file => formData.append('attachments[]', file));
    }
    return api.post<{ data: TaskComment }>(`/api/employee/my-tasks/${taskId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Manager endpoints
  getTasks: (params?: Record<string, string>) =>
    api.get<{ data: Task[] }>('/api/tasks', { params }),

  createTask: (data: CreateTaskDTO) =>
    api.post<{ data: Task }>('/api/tasks', data),

  updateTask: (id: string, data: Partial<CreateTaskDTO & { status: Task['status']; actual_minutes: number }>) =>
    api.patch<{ data: Task }>(`/api/tasks/${id}`, data),

  deleteTask: (id: string) =>
    api.delete(`/api/tasks/${id}`),

  addComment: (taskId: string, content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    if (attachments?.length) {
      attachments.forEach(file => formData.append('attachments[]', file));
    }
    return api.post<{ data: TaskComment }>(`/api/tasks/${taskId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
