/**
 * API: Face Enrollment
 * Couche d'accès aux données pour l'enregistrement facial des employés
 */

import api from '../../../lib/axios';

export interface FaceEnrollmentStatus {
  enrolled: boolean;
  count: number;
  labels: string[];
}

export interface FaceDescriptorEntry {
  descriptor: number[];
  label: string;
}

export const faceApi = {
  /**
   * Vérifier si un employé a des données faciales enregistrées
   */
  getEnrollmentStatus: async (employeeId: string): Promise<FaceEnrollmentStatus> => {
    const response = await api.get(`/api/employees/${employeeId}/face-enrollment`);
    return response.data.data;
  },

  /**
   * Enregistrer les descripteurs faciaux d'un employé
   */
  enrollFace: async (employeeId: string, descriptors: FaceDescriptorEntry[]): Promise<void> => {
    await api.post(`/api/employees/${employeeId}/face-enrollment`, { descriptors });
  },

  /**
   * Supprimer les données faciales d'un employé
   */
  deleteFaceData: async (employeeId: string): Promise<void> => {
    await api.delete(`/api/employees/${employeeId}/face-enrollment`);
  },
};
