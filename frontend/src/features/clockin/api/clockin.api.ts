/**
 * API: Clock-In
 * Couche d'accès aux données pour les opérations de pointage
 * 
 * Responsabilités:
 * - Effectuer les appels API au backend
 * - Transformer les données si nécessaire
 * - Gérer les erreurs réseau/API
 */

import api from '../../../lib/axios';
import type { ClockInRequestPayload, AttendanceResponse } from '../types';

/**
 * Points d'entrée de l'API Clock-In
 */
export const clockInApi = {
  /**
   * Effectue un pointage
   * @param data Données du pointage (channel et payload)
   * @returns Réponse contenant les données de présence
   * @throws Erreur si la requête échoue
   */
  clockIn: async (data: ClockInRequestPayload): Promise<AttendanceResponse> => {
    try {
      // pointage-service expose POST /api/pointage/clock-in (via routes/api.php + prefix('pointage'))
      const response = await api.post('/api/pointage/clock-in', data);
      return response.data.data || response.data;
    } catch (error) {
      // Relancer l'erreur pour que React Query la gère
      throw error;
    }
  },
} as const;

