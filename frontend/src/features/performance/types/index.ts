export type EvaluationStatus =
  | 'NOT_STARTED'
  | 'SELF_EVALUATION'
  | 'MANAGER_REVIEW'
  | 'CALIBRATION'
  | 'COMPLETED'
  | 'CANCELLED';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export type TemplateCategory = 'ANNUAL' | 'PROBATION' | 'PROFESSIONAL' | 'QUARTERLY';

export type ObjectiveCategory = 'INDIVIDUAL' | 'TEAM' | 'STRATEGIC';

export type ObjectiveStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'ACHIEVED'
  | 'EXCEEDED'
  | 'CANCELLED';

export interface EvaluationQuestion {
  id: string;
  label: string;
  hint?: string;
  type: 'RATING_1_5' | 'TEXT' | 'YES_NO' | 'MULTIPLE_CHOICE';
  isRequired?: boolean;
  options?: string[];
}

export interface EvaluationSection {
  id: string;
  title: string;
  description?: string;
  weight?: number;
  questions: EvaluationQuestion[];
}

export interface PerformanceTemplate {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  category: TemplateCategory;
  sections: EvaluationSection[];
  isActive: boolean;
  createdAt: string;
}

export interface PerformanceCampaign {
  id: string;
  companyId: string;
  templateId: string;
  title: string;
  description?: string;
  year: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  createdAt: string;
  template?: PerformanceTemplate;
  evaluations?: PerformanceEvaluation[];
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
  _count?: {
    evaluations: number;
  };
}

export interface PerformanceEvaluation {
  id: string;
  companyId: string;
  campaignId: string;
  employeeId: string;
  evaluatorId: string;
  status: EvaluationStatus;
  selfRating?: number | null;
  managerRating?: number | null;
  finalRating?: number | null;
  selfReviewData?: Record<string, any> | null;
  managerReviewData?: Record<string, any> | null;
  sharedNotes?: string | null;
  employeeSignedAt?: string | null;
  managerSignedAt?: string | null;
  completedAt?: string | null;
  pdfSummaryUrl?: string | null;
  createdAt: string;
  campaign?: {
    id: string;
    title: string;
    year: number;
    status: CampaignStatus;
    endDate: string;
    template?: PerformanceTemplate;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    department?: { id: string; name: string };
  };
  evaluator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
  };
  auditLogs?: Array<{
    id: string;
    action: string;
    actorId?: string;
    details?: any;
    createdAt: string;
  }>;
}

export interface PerformanceObjective {
  id: string;
  companyId: string;
  employeeId: string;
  title: string;
  description?: string;
  category: ObjectiveCategory;
  weight: number;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  progress: number;
  status: ObjectiveStatus;
  dueDate?: string | null;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
  };
}

export interface PerformanceGlobalStats {
  totalCampaigns: number;
  totalEvaluations: number;
  completedEvaluations: number;
  activeEvaluations: number;
  averageRating: number | null;
  completionRate: number;
}
