/**
 * Hook: useClockIn
 * Gère la logique de pointage avec React Query
 * 
 * Responsabilités:
 * - Appeler l'API de pointage
 * - Valider les données
 * - Invalider les caches de requête après succès
 * - Fournir les états (pending, success, error)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clockInApi } from '../api/clockin.api';
import type { ClockInRequestPayload } from '../types';

export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClockInRequestPayload | void) => {
      // Si pas de payload fourni, utiliser les valeurs par défaut
      const defaultPayload: ClockInRequestPayload = {
        channel: 'qr',
        payload: { qr_token: '' },
      };
      return clockInApi.clockIn(payload || defaultPayload);
    },
    onSuccess: () => {
      // Invalider les requêtes en cache pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      // Log l'erreur pour le debugging en développement
      console.error('Clock-in error:', error);
    },
  });
}
