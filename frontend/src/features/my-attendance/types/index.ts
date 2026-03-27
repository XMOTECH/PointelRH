export interface Attendance {
  id: string;
  employee_id: string;
  employee_name: string;
  location_name: string;
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
