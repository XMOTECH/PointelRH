export type OnboardingStatus =
  | 'DRAFT'
  | 'INVITED'
  | 'COLLECTING_DATA'
  | 'IN_REVIEW'
  | 'PROVISIONING'
  | 'READY_FOR_DAY_ONE'
  | 'IN_ORIENTATION'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskCategory =
  | 'administrative'
  | 'legal'
  | 'hse_security'
  | 'it_access'
  | 'training';

export type TargetRole =
  | 'candidate'
  | 'hr_admin'
  | 'manager'
  | 'hse_officer'
  | 'it_admin';

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'REJECTED'
  | 'SKIPPED';

export type DocumentType =
  | 'cni'
  | 'passport'
  | 'rib'
  | 'ipres_affiliation'
  | 'css_affiliation'
  | 'medical_certificate'
  | 'diploma'
  | 'criminal_record'
  | 'contract_signed'
  | 'epi_receipt'
  | 'other';

export type DocumentStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface OnboardingTemplateTask {
  id: string;
  templateId: string;
  title: string;
  description?: string | null;
  category: TaskCategory;
  targetRole: TargetRole;
  daysOffset: number;
  isRequired: boolean;
  order: number;
  prerequisiteId?: string | null;
}

export interface OnboardingTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  contractType?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  isActive: boolean;
  templateTasks: OnboardingTemplateTask[];
  createdAt: string;
}

export interface OnboardingTask {
  id: string;
  sessionId: string;
  title: string;
  description?: string | null;
  category: TaskCategory;
  assignedRole: TargetRole;
  assignedUserId?: string | null;
  status: TaskStatus;
  isRequired: boolean;
  dueDate?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  rejectionReason?: string | null;
  prerequisiteTaskId?: string | null;
  prerequisiteTask?: OnboardingTask | null;
}

export interface EmployeeDocument {
  id: string;
  companyId: string;
  sessionId?: string | null;
  employeeId?: string | null;
  documentType: DocumentType | string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  status: DocumentStatus;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface OnboardingAuditLog {
  id: string;
  sessionId: string;
  action: string;
  actorId?: string | null;
  actorIp?: string | null;
  fromState?: string | null;
  toState?: string | null;
  details?: Record<string, any> | null;
  createdAt: string;
}

export interface OnboardingSession {
  id: string;
  companyId: string;
  templateId: string;
  employeeId?: string | null;
  status: OnboardingStatus;
  magicToken?: string | null;
  magicTokenExpiresAt?: string | null;
  targetStartDate: string;
  probationEndDate?: string | null;
  stagingData?: Record<string, any> | null;
  progressPercent: number;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  template?: OnboardingTemplate;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    pinCode?: string | null;
    department?: { id: string; name: string } | null;
  } | null;
  company?: {
    id: string;
    name: string;
  };
  tasks?: OnboardingTask[];
  documents?: EmployeeDocument[];
  auditLogs?: OnboardingAuditLog[];
}

export interface CreateSessionPayload {
  templateId: string;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhone: string;
  departmentId: string;
  scheduleId?: string;
  contractType: string;
  targetStartDate: string;
  probationDurationMonths?: number;
  baseSalary?: number;
  transportAllowance?: number;
  managerId?: string;
}

export interface SubmitCandidateDataPayload {
  birthDate: string;
  birthPlace: string;
  nationality: string;
  gender: string;
  nationalIdNumber: string;
  address: string;
  maritalStatus: string;
  childrenCount: number;
  bankName?: string;
  bankRib?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  ipresNumber?: string;
  cssNumber?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  shoeSize?: string;
  clothingSize?: string;
}

export interface ReviewDocumentPayload {
  status: 'VALIDATED' | 'REJECTED';
  rejectionReason?: string;
}
