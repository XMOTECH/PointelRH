import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '../api/onboarding.api';
import { toast } from 'sonner';
import type { CreateSessionPayload, SubmitCandidateDataPayload, ReviewDocumentPayload } from '../types';

export const ONBOARDING_QUERY_KEYS = {
  allSessions: ['onboarding-sessions'] as const,
  session: (id: string) => ['onboarding-session', id] as const,
  templates: ['onboarding-templates'] as const,
  candidateSession: (token: string) => ['onboarding-candidate', token] as const,
};

export function useOnboardingSessions(status?: string) {
  return useQuery({
    queryKey: [...ONBOARDING_QUERY_KEYS.allSessions, status],
    queryFn: () => onboardingApi.getSessions(status),
  });
}

export function useOnboardingSession(id?: string) {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.session(id || ''),
    queryFn: () => onboardingApi.getSession(id!),
    enabled: !!id,
  });
}

export function useOnboardingTemplates() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.templates,
    queryFn: onboardingApi.getTemplates,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => onboardingApi.createSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.allSessions });
      toast.success('Session d\'onboarding initiée avec succès ! Le lien Magic Link a été généré.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de l\'initiation de l\'onboarding';
      toast.error(msg);
    },
  });
}

export function useUpdateTaskStatus(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status, rejectionReason }: { taskId: string; status: string; rejectionReason?: string }) =>
      onboardingApi.updateTaskStatus(sessionId, taskId, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.allSessions });
      toast.success('Tâche mise à jour');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la mise à jour de la tâche';
      toast.error(msg);
    },
  });
}

export function useReviewDocument(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, payload }: { docId: string; payload: ReviewDocumentPayload }) =>
      onboardingApi.reviewDocument(sessionId, docId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.allSessions });
      toast.success(variables.payload.status === 'VALIDATED' ? 'Document validé avec succès' : 'Document rejeté');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de l\'examen du document';
      toast.error(msg);
    },
  });
}

export function useApproveProvision(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => onboardingApi.approveReviewAndProvision(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.allSessions });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Dossier approuvé ! Employé provisionné avec Code PIN Kiosque et solde de congés.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors du provisionnement';
      toast.error(msg);
    },
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason: string }) =>
      onboardingApi.cancelSession(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.allSessions });
      toast.success('Session d\'onboarding annulée');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de l\'annulation';
      toast.error(msg);
    },
  });
}

// ── Hooks Portail Candidat ──
export function useCandidateSession(token?: string) {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.candidateSession(token || ''),
    queryFn: () => onboardingApi.getCandidateSession(token!),
    enabled: !!token,
    retry: false,
  });
}

export function useSubmitCandidateData(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitCandidateDataPayload) => onboardingApi.submitCandidateData(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.candidateSession(token) });
      toast.success('Vos informations ont été enregistrées avec succès !');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      const formatted = Array.isArray(msg)
        ? msg.join(' • ')
        : (msg || 'Erreur lors de la soumission de vos informations');
      toast.error(formatted);
    },
  });
}

export function useUploadCandidateDocument(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      documentType: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      storageKey: string;
    }) => onboardingApi.uploadCandidateDocument(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.candidateSession(token) });
      toast.success('Document téléversé avec succès !');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de l\'envoi du document';
      toast.error(msg);
    },
  });
}
