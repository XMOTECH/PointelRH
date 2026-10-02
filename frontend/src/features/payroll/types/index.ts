export type PayrollPeriodStatus = 'DRAFT' | 'CALCULATED' | 'VALIDATED' | 'PAID';

export type PayslipLineCategory =
  | 'gain'
  | 'social'
  | 'tax'
  | 'deduction'
  | 'EARNING'
  | 'DEDUCTION_EMPLOYEE'
  | 'CONTRIBUTION_EMPLOYER'
  | 'TAX'
  | 'SUMMARY';

export interface PayslipLine {
  id: string;
  payslipId: string;
  code: string;
  label?: string;
  description: string;
  category: PayslipLineCategory | string;
  base: number | null;
  rate: number | null;
  rateEmployee?: number | null;
  rateEmployer?: number | null;
  gain: number | null;
  retenue: number | null;
  patronal: number | null;
  amountEmployee?: number | null;
  amountEmployer?: number | null;
  order: number;
}

export interface PayslipEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string | null;
  isCadre?: boolean;
  department?: {
    id: string;
    name: string;
  } | null;
  bankRib?: string | null;
  bankName?: string | null;
  mobileMoneyNumber?: string | null;
  mobileMoneyProvider?: string | null;
  ipresNumber?: string | null;
  cssNumber?: string | null;
}

export interface Payslip {
  id: string;
  companyId: string;
  payrollPeriodId?: string;
  periodId?: string;
  employeeId: string;
  month?: number;
  year?: number;
  periodLabel: string;
  status: PayrollPeriodStatus;

  // Snapshot employé
  employeeName?: string;
  employeeEmail?: string;
  jobTitle?: string | null;
  departmentName?: string | null;
  isCadre?: boolean;

  // Rémunérations & Bruts
  baseSalary: number;
  sursalaire?: number;
  overtimePay: number;
  transportAllowance: number;
  transportExempt?: number;
  taxableBonuses?: number;
  nonTaxableBonuses?: number;
  bonusesTotal: number;
  grossSalary: number;
  grossTaxable?: number;
  taxableGross: number;

  // Cotisations & Fiscalité
  ipresEmployee: number;
  ipresEmployer: number;
  ipresExecEmployee: number;
  ipresExecEmployer: number;
  cssFamily: number;
  cssWorkAccident: number;
  cfceTax: number;
  incomeTax: number;
  taxIncomeTax?: number;

  // Déductions & Nets
  advancesDeducted: number;
  otherDeductions: number;
  netPay: number;
  netPayable: number;
  netSalary?: number;
  totalEmployerCost: number;
  employerTotalCost?: number;
  taxParts: number;

  createdAt: string;
  updatedAt: string;
  employee?: PayslipEmployee;
  lines?: PayslipLine[];
}

export interface PayrollPeriod {
  id: string;
  companyId: string;
  month: number;
  year: number;
  periodLabel: string;
  status: PayrollPeriodStatus;
  totalGross: number;
  totalTaxable: number;
  totalNet: number;
  totalEmployerCost: number;
  totalSocialEmployee: number;
  totalSocialEmployer: number;
  totalEmployerSocial?: number;
  totalTax: number;
  totalAdvances?: number;
  employeeCount: number;
  payslipsCount?: number;
  validatedAt?: string | null;
  validatedBy?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  payslips?: Payslip[];
}

export interface GeneratePayrollPayload {
  month: number;
  year: number;
}

export interface AddPayrollVariablePayload {
  employeeId: string;
  month: number;
  year: number;
  dto: {
    type: 'PRIME' | 'INDEMNITE' | 'RETENUE' | 'AVANCE';
    code: string;
    label: string;
    amount: number;
    isTaxable?: boolean;
    isSubjectToSocial?: boolean;
    notes?: string;
  };
}

export interface PrePayrollItem {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  base_salary: number;
  presence_days: number;
  overtime_15_hours: number;
  overtime_40_hours: number;
  overtime_60_hours: number;
  overtime_pay: number;
  transport_allowance: number;
  advances_deducted: number;
  net_salary_estimate: number;
}
