import api from '../../../lib/axios';
import type {
  OffboardingSession,
  OffboardingStats,
  OffboardingTemplate,
  CreateOffboardingSessionPayload,
  UpdateOffboardingTaskPayload,
  SaveExitInterviewPayload,
} from '../types';

export const offboardingApi = {
  getStats: async (): Promise<OffboardingStats> => {
    const response = await api.get('/api/offboarding/sessions/stats');
    return response.data.data;
  },

  getSessions: async (filters?: {
    status?: string;
    departureReason?: string;
    departmentId?: string;
    search?: string;
  }): Promise<OffboardingSession[]> => {
    const response = await api.get('/api/offboarding/sessions', { params: filters });
    return response.data.data;
  },

  getSession: async (id: string): Promise<OffboardingSession> => {
    const response = await api.get(`/api/offboarding/sessions/${id}`);
    return response.data.data;
  },

  createSession: async (data: CreateOffboardingSessionPayload): Promise<OffboardingSession> => {
    const response = await api.post('/api/offboarding/sessions', data);
    return response.data.data;
  },

  updateTask: async (taskId: string, data: UpdateOffboardingTaskPayload) => {
    const response = await api.patch(`/api/offboarding/sessions/tasks/${taskId}`, data);
    return response.data.data;
  },

  saveExitInterview: async (sessionId: string, data: SaveExitInterviewPayload) => {
    const response = await api.post(`/api/offboarding/sessions/${sessionId}/exit-interview`, data);
    return response.data.data;
  },

  saveHandoverNotes: async (sessionId: string, notes: string) => {
    const response = await api.post(`/api/offboarding/sessions/${sessionId}/handover`, { notes });
    return response.data.data;
  },

  transitionStatus: async (sessionId: string, event: any): Promise<OffboardingSession> => {
    const response = await api.post(`/api/offboarding/sessions/${sessionId}/transition`, { event });
    return response.data.data;
  },

  getTemplates: async (): Promise<OffboardingTemplate[]> => {
    const response = await api.get('/api/offboarding/templates');
    return response.data.data;
  },
};
