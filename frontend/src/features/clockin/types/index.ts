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
  work_minutes?: number;
  overtime_minutes?: number;
  clockIn?: string;
  clockOut?: string | null;
  employee?: {
    first_name: string;
    last_name: string;
  };
}

export interface ClockInRequestPayload {
  channel: string;
  company_id?: string;
  companyId?: string;
  latitude?: number;
  longitude?: number;
  payload: {
    qr_token?: string;
    pin_code?: string;
    pin?: string;
    pinCode?: string;
    user_id?: string;
    userId?: string;
    employee_id?: string;
    employeeId?: string;
    email?: string;
    descriptor?: number[];
    token?: string;
    companyId?: string;
    company_id?: string;
  };
}

export interface ClockOutRequestPayload {
  employee_id?: string;
  employeeId?: string;
  company_id?: string;
  companyId?: string;
  latitude?: number;
  longitude?: number;
}

export interface PunchRequestPayload {
  channel: 'pin' | 'face' | 'qr' | 'web' | string;
  payload: any;
  action?: 'auto' | 'in' | 'out';
  company_id?: string;
  companyId?: string;
  latitude?: number;
  longitude?: number;
}

export interface PunchResponse {
  success: boolean;
  action: 'CLOCK_IN' | 'CLOCK_OUT';
  message: string;
  attendance: any;
}

export interface AttendanceSession {
  id: string;
  clockIn: string;
  clockOut: string | null;
  isLate: boolean;
  lateMinutes: number;
  durationMinutes: number;
}

export interface TodayStatusResponse {
  id: string;
  employee_id: string;
  employee_name?: string;
  company_id?: string;
  department_id?: string;
  location_id?: string | null;
  location_name?: string | null;
  channel?: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  clock_in?: string;
  clock_out?: string | null;
  clockIn?: string;
  clockOut?: string | null;
  work_date?: string;
  late_minutes?: number;
  lateMinutes?: number;
  work_minutes?: number | null;
  workMinutes?: number | null;
  overtime_minutes?: number | null;
  status?: string;
  status_label?: string;
  // Multi-session fields
  sessions?: AttendanceSession[];
  sessionsCount?: number;
  hasActiveSession?: boolean;
  canClockIn?: boolean;
  canClockOut?: boolean;
}
