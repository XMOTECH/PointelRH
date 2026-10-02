import api from '@/lib/axios';
import type {
  PayrollPeriod,
  Payslip,
  GeneratePayrollPayload,
  AddPayrollVariablePayload,
  PrePayrollItem,
} from '../types';

function safeNum(val: any, fallback = 0): number {
  if (val === null || val === undefined || isNaN(Number(val))) return fallback;
  return Number(val);
}

function normalizePayslip(p: any): Payslip {
  if (!p) return p;

  const baseSalary = safeNum(p.baseSalary);
  const overtimePay = safeNum(p.overtimePay);
  const transportAllowance = safeNum(p.transportAllowance);
  const taxableBonuses = safeNum(p.taxableBonuses);
  const nonTaxableBonuses = safeNum(p.nonTaxableBonuses);
  const bonusesTotal = safeNum(p.bonusesTotal, taxableBonuses + nonTaxableBonuses);
  const grossSalary = safeNum(p.grossSalary);
  const grossTaxable = safeNum(p.grossTaxable ?? p.taxableGross, grossSalary);
  const ipresEmployee = safeNum(p.ipresEmployee);
  const ipresEmployer = safeNum(p.ipresEmployer);
  const incomeTax = safeNum(p.incomeTax ?? p.taxIncomeTax);
  const advancesDeducted = safeNum(p.advancesDeducted);
  const otherDeductions = safeNum(p.otherDeductions);
  const netSalary = safeNum(p.netSalary ?? p.netPayable ?? p.netPay);
  const totalEmployerCost = safeNum(p.totalEmployerCost ?? p.employerTotalCost ?? p.totalCost);
  const taxParts = safeNum(p.taxParts, 1.0);

  const empName = p.employeeName || `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.trim() || 'Collaborateur';
  const nameParts = empName.split(' ');
  const firstName = p.employee?.firstName || nameParts[0] || '';
  const lastName = p.employee?.lastName || nameParts.slice(1).join(' ') || '';

  const lines = (p.lines || []).map((l: any, idx: number) => ({
    id: l.id || `line-${idx}`,
    payslipId: l.payslipId || p.id,
    code: l.code || '',
    label: l.label || l.description || '',
    description: l.description || l.label || '',
    category: l.category || 'gain',
    base: l.base !== null && l.base !== undefined ? safeNum(l.base) : null,
    rate: l.rate !== null && l.rate !== undefined ? safeNum(l.rate) : (l.rateEmployee ? safeNum(l.rateEmployee) : null),
    rateEmployee: l.rateEmployee !== null && l.rateEmployee !== undefined ? safeNum(l.rateEmployee) : null,
    rateEmployer: l.rateEmployer !== null && l.rateEmployer !== undefined ? safeNum(l.rateEmployer) : null,
    gain: l.gain !== null && l.gain !== undefined ? safeNum(l.gain) : (l.category === 'gain' ? safeNum(l.amountEmployee) : null),
    retenue: l.retenue !== null && l.retenue !== undefined ? safeNum(l.retenue) : (l.category !== 'gain' && l.category !== 'social_employer' ? safeNum(l.amountEmployee) : null),
    patronal: l.patronal !== null && l.patronal !== undefined ? safeNum(l.patronal) : (l.amountEmployer ? safeNum(l.amountEmployer) : null),
    order: l.order ?? idx,
  }));

  return {
    ...p,
    id: p.id,
    periodLabel: p.periodLabel || `${String(p.month || '').padStart(2, '0')}/${p.year || ''}`,
    employeeName: empName,
    employeeEmail: p.employeeEmail || p.employee?.email || '',
    jobTitle: p.jobTitle || p.employee?.jobTitle || 'Collaborateur',
    departmentName: p.departmentName || p.employee?.department?.name || 'Général',
    isCadre: p.isCadre ?? p.employee?.isCadre ?? false,
    baseSalary,
    overtimePay,
    transportAllowance,
    bonusesTotal,
    grossSalary,
    taxableGross: grossTaxable,
    ipresEmployee,
    ipresEmployer,
    ipresExecEmployee: safeNum(p.ipresExecEmployee),
    ipresExecEmployer: safeNum(p.ipresExecEmployer),
    cssFamily: safeNum(p.cssFamily ?? p.cssPfEmployer),
    cssWorkAccident: safeNum(p.cssWorkAccident ?? p.cssAtEmployer),
    cfceTax: safeNum(p.cfceTax ?? p.cfceEmployer),
    incomeTax,
    taxIncomeTax: incomeTax,
    advancesDeducted,
    otherDeductions,
    netPay: netSalary,
    netPayable: netSalary,
    netSalary,
    totalEmployerCost,
    employerTotalCost: totalEmployerCost,
    taxParts,
    employee: {
      id: p.employeeId || p.employee?.id,
      firstName,
      lastName,
      email: p.employeeEmail || p.employee?.email || '',
      jobTitle: p.jobTitle || p.employee?.jobTitle || 'Collaborateur',
      isCadre: p.isCadre ?? p.employee?.isCadre ?? false,
      department: p.employee?.department || { id: '', name: p.departmentName || 'Général' },
      bankRib: p.employee?.bankRib,
      bankName: p.employee?.bankName,
      mobileMoneyNumber: p.employee?.mobileMoneyNumber,
      mobileMoneyProvider: p.employee?.mobileMoneyProvider,
      ipresNumber: p.employee?.ipresNumber,
      cssNumber: p.employee?.cssNumber,
    },
    lines,
  };
}

function normalizePeriod(raw: any): PayrollPeriod {
  if (!raw) return raw;
  const payslips = (raw.payslips || []).map(normalizePayslip);
  return {
    ...raw,
    id: raw.id,
    periodLabel: raw.periodLabel || `${String(raw.month).padStart(2, '0')}/${raw.year}`,
    employeeCount: safeNum(raw.employeeCount ?? raw.payslipsCount, payslips.length),
    totalGross: safeNum(raw.totalGross),
    totalNet: safeNum(raw.totalNet),
    totalTax: safeNum(raw.totalTax),
    totalEmployerCost: safeNum(raw.totalEmployerCost ?? raw.totalCost),
    totalSocialEmployee: safeNum(raw.totalSocialEmployee ?? raw.totalEmployeeSocial),
    totalSocialEmployer: safeNum(raw.totalSocialEmployer ?? raw.totalEmployerSocial),
    totalAdvances: safeNum(raw.totalAdvances),
    payslips,
  };
}

export const payrollApi = {
  /**
   * Lister toutes les périodes de paie de l'entreprise
   */
  getPeriods: async (): Promise<PayrollPeriod[]> => {
    const res = await api.get('/api/payroll/periods');
    const data = res.data?.data || [];
    return Array.isArray(data) ? data.map(normalizePeriod) : [];
  },

  /**
   * Obtenir les détails complets d'une période avec la liste des bulletins
   */
  getPeriod: async (id: string): Promise<PayrollPeriod> => {
    const res = await api.get(`/api/payroll/periods/${id}`);
    return normalizePeriod(res.data?.data);
  },

  /**
   * Lancer le calcul ou recalcul du moteur de paie pour un mois/année
   */
  generatePayrollRun: async (payload: GeneratePayrollPayload): Promise<PayrollPeriod> => {
    const res = await api.post('/api/payroll/run', payload);
    return normalizePeriod(res.data?.data);
  },

  /**
   * Valider et figer une période de paie
   */
  validatePeriod: async (id: string): Promise<PayrollPeriod> => {
    const res = await api.post(`/api/payroll/periods/${id}/validate`);
    return normalizePeriod(res.data?.data);
  },

  /**
   * Marquer la période et les bulletins comme payés
   */
  markPeriodAsPaid: async (id: string): Promise<PayrollPeriod> => {
    const res = await api.post(`/api/payroll/periods/${id}/mark-paid`);
    return normalizePeriod(res.data?.data);
  },

  /**
   * Obtenir un bulletin de paie détaillé avec toutes ses rubriques chiffrées
   */
  getPayslip: async (id: string): Promise<Payslip> => {
    const res = await api.get(`/api/payroll/payslips/${id}`);
    return normalizePayslip(res.data?.data);
  },

  /**
   * Ajouter une prime, indemnité ou retenue ponctuelle pour un collaborateur
   */
  addVariable: async (payload: AddPayrollVariablePayload) => {
    const res = await api.post('/api/payroll/variables', payload);
    return res.data?.data;
  },

  /**
   * Télécharger l'ordre de virement bancaire au format CSV
   */
  exportBankTransfer: async (periodId: string, filename?: string) => {
    const res = await api.get(`/api/payroll/periods/${periodId}/export-bank`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `virements-bancaires-${periodId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Télécharger l'ordre de virement Mobile Money (Wave / Orange Money) au format CSV
   */
  exportMobileMoney: async (periodId: string, filename?: string) => {
    const res = await api.get(`/api/payroll/periods/${periodId}/export-mobile-money`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `virements-wave-om-${periodId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Consulter l'ancienne pré-paie (rétro-compatibilité)
   */
  getPrePayroll: async (monthYear?: string): Promise<PrePayrollItem[]> => {
    const res = await api.get('/api/payroll/pre-payroll', {
      params: { monthYear },
    });
    return res.data?.data || [];
  },

  /**
   * Exporter l'ancienne pré-paie en CSV
   */
  exportPrePayrollCsv: async (monthYear?: string) => {
    const res = await api.get('/api/payroll/pre-payroll/export', {
      params: { monthYear },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pre-payroll-${monthYear || 'current'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
