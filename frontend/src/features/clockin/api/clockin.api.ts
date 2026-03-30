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
import type { ClockInRequestPayload, ClockOutRequestPayload, AttendanceResponse, TodayStatusResponse } from '../types';

/**
 * Points d'entrée de l'API Clock-In / Clock-Out
 */
export const clockInApi = {
  /**
   * Effectue un pointage d'entrée
   */
  clockIn: async (data: ClockInRequestPayload): Promise<AttendanceResponse> => {
    const response = await api.post('/api/pointage/clock-in', data);
    return response.data.data || response.data;
  },

  /**
   * Effectue un pointage de sortie
   */
  clockOut: async (data: ClockOutRequestPayload): Promise<AttendanceResponse> => {
    const response = await api.post('/api/pointage/clock-out', data);
    return response.data.data || response.data;
  },

  /**
   * Récupère le statut de pointage du jour pour un employé
   */
  getTodayStatus: async (employeeId: string): Promise<TodayStatusResponse> => {
    const response = await api.get('/api/pointage/attendances/my-today', {
      params: { employee_id: employeeId },
    });
    return response.data.data || null;
  },
} as const;

