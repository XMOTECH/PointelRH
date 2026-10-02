import api from '@/lib/axios';
import type {
  OnboardingTemplate,
  OnboardingSession,
  CreateSessionPayload,
  SubmitCandidateDataPayload,
  ReviewDocumentPayload,
  OnboardingTask,
  EmployeeDocument,
  OnboardingAuditLog,
} from '../types';

function normalizeTask(t: any): OnboardingTask {
  if (!t) return t;
  return {
    ...t,
    id: t.id,
    sessionId: t.session_id || t.sessionId,
    title: t.title,
    description: t.description,
    category: t.category,
    assignedRole: t.assigned_role || t.assignedRole,
    assignedUserId: t.assigned_user_id || t.assignedUserId,
    status: t.status,
    isRequired: t.is_required ?? t.isRequired ?? false,
    dueDate: t.due_date || t.dueDate,
    completedAt: t.completed_at || t.completedAt,
    completedBy: t.completed_by || t.completedBy,
    rejectionReason: t.rejection_reason || t.rejectionReason,
    prerequisiteTaskId: t.prerequisite_task_id || t.prerequisiteTaskId,
    prerequisiteTask: t.prerequisite_task ? normalizeTask(t.prerequisite_task) : (t.prerequisiteTask ? normalizeTask(t.prerequisiteTask) : null),
  };
}

function normalizeDocument(d: any): EmployeeDocument {
  if (!d) return d;
  return {
    ...d,
    id: d.id,
    companyId: d.company_id || d.companyId,
    sessionId: d.session_id || d.sessionId,
    employeeId: d.employee_id || d.employeeId,
    documentType: d.document_type || d.documentType,
    fileName: d.file_name || d.fileName,
    fileSize: d.file_size ?? d.fileSize ?? 0,
    mimeType: d.mime_type || d.mimeType,
    storageKey: d.storage_key || d.storageKey,
    status: d.status,
    rejectionReason: d.rejection_reason || d.rejectionReason,
    reviewedBy: d.reviewed_by || d.reviewedBy,
    reviewedAt: d.reviewed_at || d.reviewedAt,
    metadata: d.metadata,
    createdAt: d.created_at || d.createdAt,
  };
}

function normalizeAuditLog(a: any): OnboardingAuditLog {
  if (!a) return a;
  return {
    ...a,
    id: a.id,
    sessionId: a.session_id || a.sessionId,
    action: a.action,
    actorId: a.actor_id || a.actorId,
    actorIp: a.actor_ip || a.actorIp,
    fromState: a.from_state || a.fromState,
    toState: a.to_state || a.toState,
    details: a.details,
    createdAt: a.created_at || a.createdAt,
  };
}

function normalizeTemplate(raw: any): OnboardingTemplate {
  if (!raw) return raw;
  return {
    ...raw,
    id: raw.id,
    companyId: raw.company_id || raw.companyId,
    name: raw.name,
    description: raw.description,
    contractType: raw.contract_type || raw.contractType,
    departmentId: raw.department_id || raw.departmentId,
    department: raw.department,
    isActive: raw.is_active ?? raw.isActive ?? true,
    createdAt: raw.created_at || raw.createdAt,
    templateTasks: (raw.template_tasks || raw.templateTasks || []).map((tt: any) => ({
      ...tt,
      id: tt.id,
      templateId: tt.template_id || tt.templateId,
      title: tt.title,
      description: tt.description,
      category: tt.category,
      targetRole: tt.target_role || tt.targetRole,
      daysOffset: tt.days_offset ?? tt.daysOffset ?? 0,
      isRequired: tt.is_required ?? tt.isRequired ?? false,
      order: tt.order ?? 0,
      prerequisiteId: tt.prerequisite_id || tt.prerequisiteId,
    })),
  };
}

function toCamelCaseKey(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function deepCamelKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepCamelKeys);

  const result: Record<string, any> = { ...obj };
  for (const [key, value] of Object.entries(obj)) {
    const camel = toCamelCaseKey(key);
    result[camel] = deepCamelKeys(value);
    result[key] = deepCamelKeys(value);
  }
  return result;
}

function normalizeSession(raw: any): OnboardingSession {
  if (!raw) return raw;
  const rawStaging = raw.staging_data || raw.stagingData || {};
  const normalizedStaging = deepCamelKeys(rawStaging);

  normalizedStaging.candidateFirstName = normalizedStaging.candidateFirstName || normalizedStaging.candidate_first_name || '';
  normalizedStaging.candidateLastName = normalizedStaging.candidateLastName || normalizedStaging.candidate_last_name || '';
  normalizedStaging.candidateEmail = normalizedStaging.candidateEmail || normalizedStaging.candidate_email || '';
  normalizedStaging.candidatePhone = normalizedStaging.candidatePhone || normalizedStaging.candidate_phone || '';
  normalizedStaging.contractType = normalizedStaging.contractType || normalizedStaging.contract_type || '';
  normalizedStaging.targetStartDate = normalizedStaging.targetStartDate || normalizedStaging.target_start_date || '';
  normalizedStaging.baseSalary = normalizedStaging.baseSalary ?? normalizedStaging.base_salary;
  normalizedStaging.transportAllowance = normalizedStaging.transportAllowance ?? normalizedStaging.transport_allowance;
  normalizedStaging.departmentId = normalizedStaging.departmentId || normalizedStaging.department_id;
  normalizedStaging.scheduleId = normalizedStaging.scheduleId || normalizedStaging.schedule_id;

  // Fiscal & Personal Data
  normalizedStaging.nationalIdNumber = normalizedStaging.nationalIdNumber || normalizedStaging.national_id_number || '';
  normalizedStaging.birthDate = normalizedStaging.birthDate || normalizedStaging.birth_date || '';
  normalizedStaging.birthPlace = normalizedStaging.birthPlace || normalizedStaging.birth_place || '';
  normalizedStaging.maritalStatus = normalizedStaging.maritalStatus || normalizedStaging.marital_status || '';
  normalizedStaging.childrenCount = normalizedStaging.childrenCount ?? normalizedStaging.children_count ?? 0;
  normalizedStaging.calculatedTaxParts = normalizedStaging.calculatedTaxParts ?? normalizedStaging.calculated_tax_parts ?? 1.0;

  // Emergency contact & equipment
  normalizedStaging.emergencyContactName = normalizedStaging.emergencyContactName || normalizedStaging.emergency_contact_name || '';
  normalizedStaging.emergencyContactRelation = normalizedStaging.emergencyContactRelation || normalizedStaging.emergency_contact_relation || '';
  normalizedStaging.emergencyContactPhone = normalizedStaging.emergencyContactPhone || normalizedStaging.emergency_contact_phone || '';
  normalizedStaging.shoeSize = normalizedStaging.shoeSize || normalizedStaging.shoe_size || '';
  normalizedStaging.clothingSize = normalizedStaging.clothingSize || normalizedStaging.clothing_size || '';
  normalizedStaging.bankRib = normalizedStaging.bankRib || normalizedStaging.bank_rib || '';
  normalizedStaging.bankName = normalizedStaging.bankName || normalizedStaging.bank_name || '';
  normalizedStaging.mobileMoneyNumber = normalizedStaging.mobileMoneyNumber || normalizedStaging.mobile_money_number || '';
  normalizedStaging.mobileMoneyProvider = normalizedStaging.mobileMoneyProvider || normalizedStaging.mobile_money_provider || '';
  normalizedStaging.ipresNumber = normalizedStaging.ipresNumber || normalizedStaging.ipres_number || '';
  normalizedStaging.cssNumber = normalizedStaging.cssNumber || normalizedStaging.css_number || '';

  return {
    ...raw,
    id: raw.id,
    companyId: raw.company_id || raw.companyId,
    templateId: raw.template_id || raw.templateId,
    employeeId: raw.employee_id || raw.employeeId,
    status: raw.status,
    magicToken: raw.magic_token || raw.magicToken || '',
    magicTokenExpiresAt: raw.magic_token_expires_at || raw.magicTokenExpiresAt,
    targetStartDate: raw.target_start_date || raw.targetStartDate || '',
    probationEndDate: raw.probation_end_date || raw.probationEndDate,
    stagingData: normalizedStaging,
    progressPercent: raw.progress_percent ?? raw.progressPercent ?? 0,
    completedAt: raw.completed_at || raw.completedAt,
    cancelledAt: raw.cancelled_at || raw.cancelledAt,
    cancelReason: raw.cancel_reason || raw.cancelReason,
    createdAt: raw.created_at || raw.createdAt,
    updatedAt: raw.updated_at || raw.updatedAt,
    template: raw.template ? normalizeTemplate(raw.template) : undefined,
    employee: raw.employee
      ? {
          id: raw.employee.id,
          firstName: raw.employee.first_name || raw.employee.firstName || '',
          lastName: raw.employee.last_name || raw.employee.lastName || '',
          email: raw.employee.email || '',
          pinCode: raw.employee.pin_code || raw.employee.pinCode,
          department: raw.employee.department,
        }
      : raw.employee,
    company: raw.company,
    tasks: (raw.tasks || []).map(normalizeTask),
    documents: (raw.documents || []).map(normalizeDocument),
    auditLogs: (raw.audit_logs || raw.auditLogs || []).map(normalizeAuditLog),
  };
}

export const onboardingApi = {
  // ── Modèles / Templates ──
  getTemplates: async (): Promise<OnboardingTemplate[]> => {
    const res = await api.get('/api/onboarding/templates');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data.map(normalizeTemplate) : [];
  },

  getTemplate: async (id: string): Promise<OnboardingTemplate> => {
    const res = await api.get(`/api/onboarding/templates/${id}`);
    const data = res.data?.data ?? res.data;
    return normalizeTemplate(data);
  },

  // ── Sessions d'onboarding (Admin / RH / Manager) ──
  getSessions: async (status?: string): Promise<OnboardingSession[]> => {
    const res = await api.get('/api/onboarding/sessions', {
      params: status && status !== 'ALL' ? { status } : undefined,
    });
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data.map(normalizeSession) : [];
  },

  getSession: async (id: string): Promise<OnboardingSession> => {
    const res = await api.get(`/api/onboarding/sessions/${id}`);
    const data = res.data?.data ?? res.data;
    return normalizeSession(data);
  },

  createSession: async (payload: CreateSessionPayload): Promise<OnboardingSession> => {
    const res = await api.post('/api/onboarding/sessions', payload);
    const data = res.data?.data ?? res.data;
    return normalizeSession(data);
  },

  updateTaskStatus: async (
    sessionId: string,
    taskId: string,
    payload: { status: string; rejectionReason?: string },
  ): Promise<OnboardingTask> => {
    const res = await api.put(`/api/onboarding/sessions/${sessionId}/tasks/${taskId}`, payload);
    const data = res.data?.data ?? res.data;
    return normalizeTask(data);
  },

  reviewDocument: async (
    sessionId: string,
    docId: string,
    payload: ReviewDocumentPayload,
  ): Promise<EmployeeDocument> => {
    const res = await api.post(`/api/onboarding/sessions/${sessionId}/documents/${docId}/review`, payload);
    const data = res.data?.data ?? res.data;
    return normalizeDocument(data);
  },

  approveReviewAndProvision: async (sessionId: string): Promise<OnboardingSession> => {
    const res = await api.post(`/api/onboarding/sessions/${sessionId}/approve-provision`);
    const data = res.data?.data ?? res.data;
    return normalizeSession(data);
  },

  cancelSession: async (sessionId: string, reason: string): Promise<OnboardingSession> => {
    const res = await api.post(`/api/onboarding/sessions/${sessionId}/cancel`, { reason });
    const data = res.data?.data ?? res.data;
    return normalizeSession(data);
  },

  // ── Portail Public Candidat (Magic Link) ──
  getCandidateSession: async (token: string): Promise<OnboardingSession> => {
    const res = await api.get(`/api/onboarding/candidate/${token}`);
    const data = res.data?.data ?? res.data;
    return normalizeSession(data);
  },

  submitCandidateData: async (
    token: string,
    payload: SubmitCandidateDataPayload,
  ): Promise<OnboardingSession> => {
    const res = await api.post(`/api/onboarding/candidate/${token}/submit`, payload);
    const data = res.data?.data ?? res.data;
    return normalizeSession(data);
  },

  uploadCandidateDocument: async (
    token: string,
    payload: {
      documentType: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      storageKey: string;
    },
  ): Promise<EmployeeDocument> => {
    const res = await api.post(`/api/onboarding/candidate/${token}/documents`, payload);
    const data = res.data?.data ?? res.data;
    return normalizeDocument(data);
  },
};
