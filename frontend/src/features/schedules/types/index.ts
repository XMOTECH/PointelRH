export interface ComplianceViolation {
  rule: 'LEAVE_CONFLICT' | 'SHIFT_OVERLAP' | 'DAILY_REST_INSUFFICIENT' | 'MAX_DAILY_HOURS' | 'MAX_WEEKLY_HOURS' | 'CONSECUTIVE_DAYS';
  severity: 'ERROR' | 'WARNING';
  message: string;
  shiftId?: string;
  employeeId?: string;
  date?: string;
  details?: Record<string, any>;
}

export interface ShiftItem {
  id: string;
  type: 'shift' | 'leave' | 'mission';
  status: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  jobTitle?: string;
  color?: string;
  notes?: string;
  title?: string;
  violations?: ComplianceViolation[];
}

export interface DaySummary {
  date: string;
  totalNetHours: number;
  scheduledHeadcount: number;
  openShiftsCount: number;
}

export interface EmployeeRow {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    departmentName?: string;
    standardScheduleName?: string;
  };
  stats: {
    totalNetHours: number;
    totalBreakMinutes: number;
    shiftCount: number;
    violationsCount: number;
  };
  violations: ComplianceViolation[];
  days: Record<string, ShiftItem[]>;
}

export interface PlanningWeekData {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
  publishedBy?: string | null;
  notes?: string | null;
}

export interface PlanningWeekResponse {
  planningWeek: PlanningWeekData;
  weekDays: string[];
  daysSummary: Record<string, DaySummary>;
  openShifts: any[];
  violations: ComplianceViolation[];
  employees: EmployeeRow[];
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  color?: string;
  jobTitle?: string | null;
  departmentId?: string | null;
  isActive?: boolean;
}

export interface CreateShiftPayload {
  employeeId?: string | null;
  departmentId?: string | null;
  templateId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  jobTitle?: string | null;
  color?: string;
  notes?: string | null;
  isUnassigned?: boolean;
}

export interface DuplicateWeekPayload {
  sourceWeekStart: string;
  targetWeekStart: string;
  departmentId?: string;
  overwriteExisting?: boolean;
}
