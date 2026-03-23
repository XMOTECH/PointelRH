/**
 * Types pour le module Clock-In
 */

import { AxiosError } from 'axios';

export interface ClockInStatus {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: AxiosError | null;
}

export interface AttendanceResponse {
  id: string;
  employee_id: string;
  date: string;
  time: string;
  channel: string;
  late_minutes?: number;
}

export interface ClockInRequestPayload {
  channel: string;
  payload: {
    qr_token?: string;
    pin_code?: string;
  };
}
