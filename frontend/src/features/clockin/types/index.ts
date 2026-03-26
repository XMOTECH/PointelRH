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
  employee?: {
    first_name: string;
    last_name: string;
  };
}

export interface ClockInRequestPayload {
  channel: string;
  company_id?: string;
  payload: {
    qr_token?: string;
    pin_code?: string;
  };
}
