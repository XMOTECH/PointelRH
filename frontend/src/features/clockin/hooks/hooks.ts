/**
 * Hooks personnalisés pour la page Clock-In
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DELAYS } from '../constants';
import { employeesApi } from '../../employees/api/employees.api';

/**
 * Hook pour gérer l'horloge en temps réel
 * Responsabilité unique: mettre à jour l'heure chaque seconde
 */
export function useRealTimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), DELAYS.clockUpdateInterval);
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}

/**
 * Hook pour récupérer le vrai qr_token de l'employé depuis l'API
 * Responsabilité unique: récupérer le qr_token et le mettre en cache
 */
export function useQRCodeData(employeeId: string | undefined): { qrToken: string | null; isLoading: boolean } {
  const { data: qrToken = null, isLoading } = useQuery({
    queryKey: ['employee-qr', employeeId],
    queryFn: () => employeesApi.getMyQrToken(employeeId!),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes — le token ne change pas souvent
  });

  return { qrToken: qrToken ?? null, isLoading };
}

/**
 * Hook pour formatter les dates et heures dans la locale appropriée
 * Responsabilité unique: formater les valeurs temps pour l'affichage
 */
export function useTimeFormatting() {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return { formatTime, formatDate };
}
