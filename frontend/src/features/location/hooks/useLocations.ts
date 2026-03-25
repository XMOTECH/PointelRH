import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi, type SitePayload } from '../api/locations.api';
import { toast } from 'sonner';

const LOCATIONS_KEY = ['locations'];

export function useLocations() {
  return useQuery({
    queryKey: LOCATIONS_KEY,
    queryFn: locationsApi.getLocations,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SitePayload) => locationsApi.createLocation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success('Site créé avec succès');
    },
    onError: () => toast.error('Erreur lors de la création du site'),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SitePayload> }) =>
      locationsApi.updateLocation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success('Site mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationsApi.deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success('Site supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
}
