import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offboardingApi } from '../api/offboarding.api';
import type {
  CreateOffboardingSessionPayload,
  UpdateOffboardingTaskPayload,
  SaveExitInterviewPayload,
} from '../types';

export const OFFBOARDING_KEYS = {
  all: ['offboarding'] as const,
  stats: () => [...OFFBOARDING_KEYS.all, 'stats'] as const,
  sessions: (filters?: any) => [...OFFBOARDING_KEYS.all, 'sessions', filters] as const,
  session: (id: string) => [...OFFBOARDING_KEYS.all, 'session', id] as const,
  templates: () => [...OFFBOARDING_KEYS.all, 'templates'] as const,
};

export function useOffboardingStats() {
  return useQuery({
    queryKey: OFFBOARDING_KEYS.stats(),
    queryFn: () => offboardingApi.getStats(),
    refetchInterval: 30_000,
  });
}

export function useOffboardingSessions(filters?: {
  status?: string;
  departureReason?: string;
  departmentId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: OFFBOARDING_KEYS.sessions(filters),
    queryFn: () => offboardingApi.getSessions(filters),
  });
}

export function useOffboardingSession(id: string | null) {
  return useQuery({
    queryKey: OFFBOARDING_KEYS.session(id || ''),
    queryFn: () => offboardingApi.getSession(id!),
    enabled: !!id,
  });
}

export function useOffboardingTemplates() {
  return useQuery({
    queryKey: OFFBOARDING_KEYS.templates(),
    queryFn: () => offboardingApi.getTemplates(),
  });
}

export function useCreateOffboardingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOffboardingSessionPayload) => offboardingApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFBOARDING_KEYS.all });
    },
  });
}

export function useUpdateOffboardingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateOffboardingTaskPayload }) =>
      offboardingApi.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFBOARDING_KEYS.all });
    },
  });
}

export function useSaveExitInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SaveExitInterviewPayload }) =>
      offboardingApi.saveExitInterview(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFBOARDING_KEYS.all });
    },
  });
}

export function useSaveHandoverNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string; notes: string }) =>
      offboardingApi.saveHandoverNotes(sessionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFBOARDING_KEYS.all });
    },
  });
}

export function useTransitionOffboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, event }: { sessionId: string; event: any }) =>
      offboardingApi.transitionStatus(sessionId, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFBOARDING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
