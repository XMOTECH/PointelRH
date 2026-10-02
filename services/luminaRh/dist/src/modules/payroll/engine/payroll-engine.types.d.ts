export interface EmployeePayrollProfile {
    id: string;
    matricule?: string;
    firstName: string;
    lastName: string;
    departmentName?: string;
    jobTitle?: string;
    contractType: 'cdi' | 'cdd' | 'stage' | 'prestataire' | string;
    isCadre: boolean;
    baseSalary: number;
    sursalaire?: number;
    taxParts: number;
    transportAllowance?: number;
    cssRiskRate?: number;
}
export interface OvertimeInput {
    hours15?: number;
    hours40?: number;
    hours60?: number;
    hours100?: number;
}
export interface PayrollBonusItem {
    id?: string;
    name: string;
    amount: number;
    isTaxable: boolean;
    isSubjectToSocial: boolean;
}
export interface PayrollDeductionItem {
    id?: string;
    name: string;
    amount: number;
}
export interface PayrollCalculationInput {
    employee: EmployeePayrollProfile;
    month: number;
    year: number;
    presenceDays?: number;
    totalWorkingDays?: number;
    overtime?: OvertimeInput;
    bonuses?: PayrollBonusItem[];
    deductions?: PayrollDeductionItem[];
    advancesDeducted?: number;
}
export interface OvertimeResult {
    hourlyRate: number;
    hours15: number;
    pay15: number;
    hours40: number;
    pay40: number;
    hours60: number;
    pay60: number;
    hours100: number;
    pay100: number;
    totalOvertimePay: number;
}
export interface SocialContributionsBreakdown {
    grossCotisable: number;
    ipresRgBase: number;
    ipresRgEmployeeRate: number;
    ipresRgEmployeeAmount: number;
    ipresRgEmployerRate: number;
    ipresRgEmployerAmount: number;
    ipresRccBase: number;
    ipresRccEmployeeRate: number;
    ipresRccEmployeeAmount: number;
    ipresRccEmployerRate: number;
    ipresRccEmployerAmount: number;
    cssPfBase: number;
    cssPfRate: number;
    cssPfAmount: number;
    cssAtBase: number;
    cssAtRate: number;
    cssAtAmount: number;
    cfceBase: number;
    cfceRate: number;
    cfceAmount: number;
    totalEmployeeSocial: number;
    totalEmployerSocial: number;
}
export interface TaxBreakdown {
    grossTaxable: number;
    ipresDeduction: number;
    professionalExpensesDeduction: number;
    netTaxableIncomeMonthly: number;
    netTaxableIncomeAnnual: number;
    taxParts: number;
    taxablePerPartAnnual: number;
    irAnnual: number;
    irMonthly: number;
}
export interface PayslipItemLine {
    code: string;
    label: string;
    base: number;
    rateEmployee?: number;
    amountEmployee?: number;
    rateEmployer?: number;
    amountEmployer?: number;
}
export interface CalculatedPayslip {
    employeeId: string;
    month: number;
    year: number;
    baseSalary: number;
    sursalaire: number;
    transportAllowance: number;
    transportExemptAmount: number;
    totalOvertimePay: number;
    taxableBonuses: number;
    nonTaxableBonuses: number;
    grossSalaryTotal: number;
    overtimeDetails: OvertimeResult;
    social: SocialContributionsBreakdown;
    tax: TaxBreakdown;
    advancesDeducted: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalaryBeforeTax: number;
    netTaxable: number;
    netPay: number;
    totalEmployerCost: number;
    lines: PayslipItemLine[];
}
