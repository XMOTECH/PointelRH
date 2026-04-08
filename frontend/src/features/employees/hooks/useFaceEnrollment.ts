/**
 * Hook: useFaceEnrollment
 * Gère l'état d'enrollment facial d'un employé via React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { faceApi, type FaceDescriptorEntry } from '../api/face.api';

export function useFaceEnrollmentStatus(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['face-enrollment', employeeId],
    queryFn: () => faceApi.getEnrollmentStatus(employeeId!),
    enabled: !!employeeId,
  });
}

export function useEnrollFace(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (descriptors: FaceDescriptorEntry[]) => {
      if (!employeeId) throw new Error('Employee ID requis');
      return faceApi.enrollFace(employeeId, descriptors);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['face-enrollment', employeeId] });
    },
  });
}

export function useDeleteFaceData(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!employeeId) throw new Error('Employee ID requis');
      return faceApi.deleteFaceData(employeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['face-enrollment', employeeId] });
    },
  });
}
