import api from '../../../lib/axios';

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

export const tasksApi = {
  // Employee endpoints
  getMyTasks: (params?: Record<string, string>) =>
    api.get<{ data: Task[] }>('/api/employee/my-tasks', { params }),

  updateMyTaskStatus: (id: string, status: Task['status']) =>
    api.patch<{ data: Task }>(`/api/employee/my-tasks/${id}/status`, { status }),

  logTime: (id: string, minutes: number) =>
    api.post<{ data: { actual_minutes: number } }>(`/api/employee/my-tasks/${id}/timer`, { minutes }),

  // Manager endpoints
  getTasks: (params?: Record<string, string>) =>
    api.get<{ data: Task[] }>('/api/tasks', { params }),

  createTask: (data: CreateTaskDTO) =>
    api.post<{ data: Task }>('/api/tasks', data),

  updateTask: (id: string, data: Partial<CreateTaskDTO & { status: Task['status']; actual_minutes: number }>) =>
    api.patch<{ data: Task }>(`/api/tasks/${id}`, data),

  deleteTask: (id: string) =>
    api.delete(`/api/tasks/${id}`),

  addComment: (taskId: string, content: string) =>
    api.post<{ data: TaskComment }>(`/api/tasks/${taskId}/comments`, { content }),
};
