import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCompanyData } from '../api/admin.api';
import { adminApi } from '../api/admin.api';
import { toast } from 'sonner';

export const useCompanies = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'companies', params],
    queryFn: () => adminApi.getCompanies(params),
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyData) => adminApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      toast.success('Entreprise créée avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });
};

export const useGlobalStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getGlobalStats(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useToggleCompanyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.toggleCompanyStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      toast.success('Statut mis à jour');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });
};
