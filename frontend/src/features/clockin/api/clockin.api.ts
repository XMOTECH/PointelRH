/**
 * API: Clock-In
 * Couche d'accès aux données pour les opérations de pointage
 */

import api from '../../../lib/axios';
import type {
  ClockInRequestPayload,
  ClockOutRequestPayload,
  AttendanceResponse,
  TodayStatusResponse,
  PunchRequestPayload,
  PunchResponse,
} from '../types';

/**
 * Points d'entrée de l'API Clock-In / Clock-Out / Punch
 */
export const clockInApi = {
  /**
   * Effectue un pointage d'entrée standard
   */
  clockIn: async (data: ClockInRequestPayload): Promise<AttendanceResponse> => {
    const response = await api.post('/api/pointage/clock-in', data);
    return response.data.data || response.data;
  },

  /**
   * Effectue un pointage de sortie standard
   */
  clockOut: async (data: ClockOutRequestPayload): Promise<AttendanceResponse> => {
    const response = await api.post('/api/pointage/clock-out', data);
    return response.data.data || response.data;
  },

  /**
   * Smart Punch universel : bascule automatiquement entre entrée et sortie
   * Déterministe et sans erreurs 409
   */
  punch: async (data: PunchRequestPayload): Promise<PunchResponse> => {
    const response = await api.post('/api/pointage/punch', data);
    return response.data;
  },

  /**
   * Récupère le statut de pointage du jour pour un employé (avec sessions multiples)
   */
  getTodayStatus: async (employeeId: string): Promise<TodayStatusResponse> => {
    const response = await api.get('/api/pointage/attendances/my-today', {
      params: { employee_id: employeeId },
    });
    return response.data.data || null;
  },
} as const;
