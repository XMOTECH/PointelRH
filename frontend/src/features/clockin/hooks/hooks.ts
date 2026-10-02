/**
 * Hooks personnalisés pour la page Clock-In
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DELAYS } from '../constants';
import { employeesApi } from '../../employees/api/employees.api';
import { clockInApi } from '../api/clockin.api';

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
 * Hook pour récupérer le statut de pointage du jour
 * Retourne l'attendance du jour + indicateurs isCheckedIn / isCheckedOut
 */
export function useTodayStatus(employeeId: string | undefined) {
  const { data: rawTodayAttendance = null, isLoading } = useQuery<any>({
    queryKey: ['today-status', employeeId],
    queryFn: () => clockInApi.getTodayStatus(employeeId!),
    enabled: !!employeeId,
    refetchInterval: 5_000,
  });

  const todayAttendance = rawTodayAttendance ? {
    ...rawTodayAttendance,
    checked_in_at: rawTodayAttendance.checked_in_at || rawTodayAttendance.clockIn || rawTodayAttendance.clock_in || null,
    checked_out_at: rawTodayAttendance.checked_out_at || rawTodayAttendance.clockOut || rawTodayAttendance.clock_out || null,
  } : null;

  // En multi-session : l'employé est en poste si une session est actuellement ouverte (clockOut == null)
  const hasActiveSession = rawTodayAttendance?.hasActiveSession !== undefined
    ? rawTodayAttendance.hasActiveSession
    : (!!todayAttendance?.checked_in_at && !todayAttendance?.checked_out_at);

  const isCheckedIn = hasActiveSession;
  const isCheckedOut = !hasActiveSession && ((rawTodayAttendance?.sessionsCount ?? 0) > 0 || !!todayAttendance?.checked_out_at);
  const canClockIn = rawTodayAttendance?.canClockIn !== undefined ? rawTodayAttendance.canClockIn : !hasActiveSession;
  const canClockOut = rawTodayAttendance?.canClockOut !== undefined ? rawTodayAttendance.canClockOut : hasActiveSession;

  return {
    todayAttendance,
    isCheckedIn,
    isCheckedOut,
    hasActiveSession,
    canClockIn,
    canClockOut,
    sessions: rawTodayAttendance?.sessions || [],
    isLoading,
  };
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
