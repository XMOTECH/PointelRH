/**
 * Hook personnalisé pour gérer l'horloge en temps réel
 * Responsabilité unique: mettre à jour l'heure chaque seconde
 */

import { useEffect, useState } from 'react';
import { DELAYS } from '../constants';

export function useRealTimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), DELAYS.clockUpdateInterval);
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}

/**
 * Hook pour générer et gérer le QR Code
 * Responsabilité unique: créer les données du QR Code
 */
import { useMemo } from 'react';

interface QRData {
  user_id: string | undefined;
  type: 'clock-in';
  timestamp: string;
}

export function useQRCodeData(userId: string | undefined): string {
  return useMemo(() => {
    const qrData: QRData = {
      user_id: userId,
      type: 'clock-in',
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(qrData);
  }, [userId]);
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
