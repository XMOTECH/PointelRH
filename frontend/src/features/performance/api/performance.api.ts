import api from '../../../lib/axios';
import type {
  PerformanceCampaign,
  PerformanceEvaluation,
  PerformanceTemplate,
  PerformanceObjective,
  PerformanceGlobalStats,
} from '../types';

export const performanceApi = {
  // Global stats
  getGlobalStats: async (): Promise<PerformanceGlobalStats> => {
    const response = await api.get('/api/performance/campaigns/stats');
    return response.data.data;
  },

  // Campaigns
  getCampaigns: async (): Promise<PerformanceCampaign[]> => {
    const response = await api.get('/api/performance/campaigns');
    return response.data.data;
  },

  getCampaign: async (id: string): Promise<PerformanceCampaign> => {
    const response = await api.get(`/api/performance/campaigns/${id}`);
    return response.data.data;
  },

  createCampaign: async (payload: {
    title: string;
    description?: string;
    templateId: string;
    year: number;
    startDate: string;
    endDate: string;
    departmentIds?: string[];
    employeeIds?: string[];
  }): Promise<PerformanceCampaign> => {
    const response = await api.post('/api/performance/campaigns', payload);
    return response.data.data;
  },

  closeCampaign: async (id: string): Promise<PerformanceCampaign> => {
    const response = await api.post(`/api/performance/campaigns/${id}/close`);
    return response.data.data;
  },

  // Templates
  getTemplates: async (): Promise<PerformanceTemplate[]> => {
    const response = await api.get('/api/performance/templates');
    return response.data.data;
  },

  getTemplate: async (id: string): Promise<PerformanceTemplate> => {
    const response = await api.get(`/api/performance/templates/${id}`);
    return response.data.data;
  },

  // Evaluations
  getEvaluations: async (filters?: {
    campaignId?: string;
    status?: string;
    employeeId?: string;
  }): Promise<PerformanceEvaluation[]> => {
    const response = await api.get('/api/performance/evaluations', { params: filters });
    return response.data.data;
  },

  getEvaluation: async (id: string): Promise<PerformanceEvaluation> => {
    const response = await api.get(`/api/performance/evaluations/${id}`);
    return response.data.data;
  },

  startSelfEvaluation: async (id: string): Promise<PerformanceEvaluation> => {
    const response = await api.post(`/api/performance/evaluations/${id}/start-self-evaluation`);
    return response.data.data;
  },

  saveDraftSelfReview: async (
    id: string,
    answers: Record<string, any>,
    selfRating?: number,
  ): Promise<PerformanceEvaluation> => {
    const response = await api.put(`/api/performance/evaluations/${id}/draft-self-review`, {
      answers,
      selfRating,
    });
    return response.data.data;
  },

  submitSelfReview: async (
    id: string,
    answers: Record<string, any>,
    selfRating?: number,
  ): Promise<PerformanceEvaluation> => {
    const response = await api.post(`/api/performance/evaluations/${id}/submit-self-review`, {
      answers,
      selfRating,
    });
    return response.data.data;
  },

  submitManagerReview: async (
    id: string,
    answers: Record<string, any>,
    managerRating: number,
    sharedNotes?: string,
  ): Promise<PerformanceEvaluation> => {
    const response = await api.post(`/api/performance/evaluations/${id}/submit-manager-review`, {
      answers,
      managerRating,
      sharedNotes,
    });
    return response.data.data;
  },

  signEvaluation: async (
    id: string,
    signerRole: 'EMPLOYEE' | 'MANAGER',
    finalComment?: string,
  ): Promise<PerformanceEvaluation> => {
    const response = await api.post(`/api/performance/evaluations/${id}/sign`, {
      signerRole,
      finalComment,
    });
    return response.data.data;
  },

  // Objectives
  getObjectives: async (employeeId?: string): Promise<PerformanceObjective[]> => {
    const response = await api.get('/api/performance/objectives', {
      params: employeeId ? { employeeId } : undefined,
    });
    return response.data.data;
  },

  createObjective: async (payload: {
    employeeId: string;
    title: string;
    description?: string;
    category?: string;
    weight?: number;
    targetValue?: number;
    unit?: string;
    dueDate?: string;
  }): Promise<PerformanceObjective> => {
    const response = await api.post('/api/performance/objectives', payload);
    return response.data.data;
  },

  updateObjective: async (
    id: string,
    payload: {
      title?: string;
      description?: string;
      currentValue?: number;
      progress?: number;
      status?: string;
    },
  ): Promise<PerformanceObjective> => {
    const response = await api.patch(`/api/performance/objectives/${id}`, payload);
    return response.data.data;
  },

  deleteObjective: async (id: string): Promise<void> => {
    await api.delete(`/api/performance/objectives/${id}`);
  },
};
