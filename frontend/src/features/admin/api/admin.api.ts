import api from '@/lib/axios';

export interface Company {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  users_count?: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateCompanyData {
  company_name: string;
  plan: 'free' | 'pro' | 'enterprise';
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface GlobalStats {
  total_companies: number;
  active_users: number;
  plan_distribution: Record<string, number>;
  sla_status: string;
}

export const adminApi = {
  getGlobalStats: async () => {
    const response = await api.get('/api/auth/admin/stats');
    return response.data.data as GlobalStats;
  },

  getCompanies: async (params?: { page?: number; per_page?: number; search?: string }) => {
    const response = await api.get('/api/auth/admin/companies', { params });
    // Backend now returns paginated response wrapped in success envelope
    const payload = response.data.data ?? response.data;
    return payload as PaginatedResponse<Company>;
  },

  createCompany: async (data: CreateCompanyData) => {
    const response = await api.post('/api/auth/admin/companies', data);
    return response.data.data;
  },

  toggleCompanyStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/api/auth/admin/companies/${id}/status`, { is_active: isActive });
    return response.data.data;
  },
};
