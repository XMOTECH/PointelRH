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
    user_id?: string;
  };
}

export interface ClockOutRequestPayload {
  employee_id: string;
}

export interface TodayStatusResponse {
  id: string;
  employee_id: string;
  employee_name: string;
  company_id: string;
  department_id: string;
  location_id: string | null;
  location_name: string | null;
  channel: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  work_date: string;
  late_minutes: number;
  work_minutes: number | null;
  overtime_minutes: number | null;
  status: string;
  status_label: string;
}
