/**
 * Types & Interfaces for the Senegalese Payroll Engine (LuminaRH)
 * Conforms to CGI Senegal (art. 37-38), Code du Travail, CCNI, IPRES & CSS regulations.
 */

export interface EmployeePayrollProfile {
  id: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  departmentName?: string;
  jobTitle?: string;
  contractType: 'cdi' | 'cdd' | 'stage' | 'prestataire' | string;
  isCadre: boolean;
  baseSalary: number; // Salaire de base contractuel en FCFA
  sursalaire?: number; // Sursalaire conventionnel éventuel
  taxParts: number; // Nombre de parts fiscales IR (ex: 1.0, 1.5, 2.0 ... jusqu'à 5.0)
  transportAllowance?: number; // Indemnité de transport (défaut légal 20 800 FCFA)
  cssRiskRate?: number; // Taux accident du travail CSS (0.01 = 1%, 0.03 = 3%, 0.05 = 5%)
}

export interface OvertimeInput {
  hours15?: number; // Heures sup de jour à 15% (41e à 48e heure de la semaine)
  hours40?: number; // Heures sup de jour à 40% (au-delà de la 48e heure)
  hours60?: number; // Heures sup dimanche / jour férié de jour (60%)
  hours100?: number; // Heures sup dimanche / jour férié de nuit (100%)
}

export interface PayrollBonusItem {
  id?: string;
  name: string;
  amount: number;
  isTaxable: boolean; // Soumis à l'IR
  isSubjectToSocial: boolean; // Soumis à l'IPRES / CSS
}

export interface PayrollDeductionItem {
  id?: string;
  name: string;
  amount: number;
}

export interface PayrollCalculationInput {
  employee: EmployeePayrollProfile;
  month: number; // 1 - 12
  year: number;
  presenceDays?: number; // Jours de présence réels (par défaut 22 jours ouvrés)
  totalWorkingDays?: number; // Total jours ouvrables du mois (défaut 22)
  overtime?: OvertimeInput;
  bonuses?: PayrollBonusItem[];
  deductions?: PayrollDeductionItem[];
  advancesDeducted?: number; // Acomptes approuvés sur salaire
}

export interface OvertimeResult {
  hourlyRate: number; // Salaire horaire = Base / 173.333
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
  grossCotisable: number; // Assiette soumise à cotisation
  // IPRES Régime Général (RG)
  ipresRgBase: number;
  ipresRgEmployeeRate: number; // 5.6%
  ipresRgEmployeeAmount: number;
  ipresRgEmployerRate: number; // 8.4%
  ipresRgEmployerAmount: number;
  // IPRES Régime Cadre (RCC)
  ipresRccBase: number;
  ipresRccEmployeeRate: number; // 2.4% (si cadre)
  ipresRccEmployeeAmount: number;
  ipresRccEmployerRate: number; // 3.6% (si cadre)
  ipresRccEmployerAmount: number;
  // CSS Prestations Familiales (PF) - 100% Patronal
  cssPfBase: number;
  cssPfRate: number; // 7.0%
  cssPfAmount: number;
  // CSS Accidents du Travail (AT) - 100% Patronal
  cssAtBase: number;
  cssAtRate: number; // 1% à 5%
  cssAtAmount: number;
  // CFCE (Contribution Forfaitaire à la Charge des Employeurs) - 100% Patronal
  cfceBase: number;
  cfceRate: number; // 3.0%
  cfceAmount: number;
  // Totaux
  totalEmployeeSocial: number;
  totalEmployerSocial: number;
}

export interface TaxBreakdown {
  grossTaxable: number;
  ipresDeduction: number;
  professionalExpensesDeduction: number; // 30% plafonné à 75 000 FCFA/mois
  netTaxableIncomeMonthly: number; // RNI mensuel
  netTaxableIncomeAnnual: number; // RNI annuel
  taxParts: number; // N
  taxablePerPartAnnual: number; // RNI annuel / N
  irAnnual: number;
  irMonthly: number; // IR retenu à la source
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
  // Éléments de gain
  baseSalary: number;
  sursalaire: number;
  transportAllowance: number; // Part réelle versée (prorisée)
  transportExemptAmount: number; // Part exonérée (max 20 800)
  totalOvertimePay: number;
  taxableBonuses: number;
  nonTaxableBonuses: number;
  grossSalaryTotal: number; // Brut total
  // Cotisations & Fiscalité
  overtimeDetails: OvertimeResult;
  social: SocialContributionsBreakdown;
  tax: TaxBreakdown;
  // Retenues diverses
  advancesDeducted: number;
  otherDeductions: number;
  totalDeductions: number;
  // Soldes nets
  netSalaryBeforeTax: number;
  netTaxable: number;
  netPay: number; // Net à payer collaborateur (en FCFA)
  totalEmployerCost: number; // Coût global employeur (Brut + Cotisations patronales)
  // Lignes de bulletin pour affichage & impression
  lines: PayslipItemLine[];
}
