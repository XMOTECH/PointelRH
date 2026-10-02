export type OffboardingStatus =
  | 'INITIATED'
  | 'IN_PROGRESS'
  | 'PENDING_DOCUMENTS'
  | 'COMPLETED'
  | 'CANCELLED';

export type DepartureReason =
  | 'RESIGNATION'
  | 'DISMISSAL'
  | 'END_OF_CONTRACT'
  | 'TRIAL_PERIOD_TERMINATION'
  | 'MUTUAL_AGREEMENT'
  | 'RETIREMENT'
  | 'OTHER';

export type NoticePeriodType =
  | 'WORKED'
  | 'EXEMPTED_PAID'
  | 'EXEMPTED_UNPAID'
  | 'NONE';

export type OffboardingTaskCategory =
  | 'it'
  | 'security'
  | 'hr'
  | 'finance'
  | 'manager'
  | 'logistics'
  | 'administrative';

export type OffboardingTaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'WAIVED';

export interface OffboardingTask {
  id: string;
  sessionId: string;
  title: string;
  description?: string | null;
  category: OffboardingTaskCategory;
  assignedRole: string;
  assignedUserId?: string | null;
  status: OffboardingTaskStatus;
  isRequired: boolean;
  dueDate?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OffboardingTemplateTask {
  id: string;
  templateId: string;
  title: string;
  description?: string | null;
  category: OffboardingTaskCategory;
  assignedRole: string;
  daysOffset: number;
  isRequired: boolean;
  order: number;
}

export interface OffboardingTemplate {
  id: string;
  name: string;
  description?: string | null;
  departureType?: DepartureReason | null;
  departmentId?: string | null;
  isActive: boolean;
  templateTasks: OffboardingTemplateTask[];
}

export interface OffboardingAuditLog {
  id: string;
  sessionId: string;
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  fromState?: string | null;
  toState?: string | null;
  details?: any;
  createdAt: string;
}

export interface OffboardingSession {
  id: string;
  companyId: string;
  employeeId: string;
  templateId?: string | null;
  status: OffboardingStatus;
  departureReason: DepartureReason;
  noticePeriodType: NoticePeriodType;
  notificationDate: string;
  lastWorkingDate: string;
  contractEndDate: string;
  handoverNotes?: string | null;
  exitInterviewNotes?: string | null;
  reasonsFeedback?: string | null;
  progressPercent: number;
  completedAt?: string | null;
  completedBy?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string | null;
    contractType: string;
    hireDate: string;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  template?: OffboardingTemplate | null;
  tasks: OffboardingTask[];
  totalTasks?: number;
  completedTasks?: number;
  auditLogs?: OffboardingAuditLog[];
  financialSummary?: {
    leaveBalances: Array<{
      leaveType: string;
      remainingDays: number;
    }>;
    unpaidAdvances: Array<{
      id: string;
      amount: number;
      type: string;
      reason?: string | null;
      createdAt: string;
    }>;
    totalUnpaidAdvanceAmount: number;
  };
  openWorkItems?: {
    tasksCount: number;
    tasks: any[];
  };
}

export interface OffboardingStats {
  activeCount: number;
  completedThisMonth: number;
  overdueTasksCount: number;
  totalPendingTasks: number;
}

export interface CreateOffboardingSessionPayload {
  employeeId: string;
  departureReason: DepartureReason;
  noticePeriodType?: NoticePeriodType;
  notificationDate?: string;
  lastWorkingDate: string;
  contractEndDate: string;
  templateId?: string;
  handoverNotes?: string;
}

export interface UpdateOffboardingTaskPayload {
  status: OffboardingTaskStatus;
  notes?: string;
}

export interface SaveExitInterviewPayload {
  exitInterviewNotes: string;
  reasonsFeedback?: string;
}
