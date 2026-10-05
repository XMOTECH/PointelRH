import { SENEGAL_PAYROLL_CONSTANTS } from './senegal-constants';
import {
  PayrollCalculationInput,
  CalculatedPayslip,
  PayslipItemLine,
} from './payroll-engine.types';
import { SenegalSocialCalculator } from './senegal-social.calculator';
import { SenegalTaxCalculator } from './senegal-tax.calculator';
import { OvertimeCalculator } from './overtime.calculator';

/**
 * Moteur de calcul principal de paie sénégalaise (LuminaRH).
 * Pure domain service : zéro dépendance à la base de données, déterministe et 100% testable.
 */
export class SenegalesePayrollEngine {
  /**
   * Calcule un bulletin de paie complet et décomposé pour un collaborateur donné.
   */
  public static calculate(input: PayrollCalculationInput): CalculatedPayslip {
    const {
      employee,
      month,
      year,
      presenceDays,
      totalWorkingDays = SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS,
      overtime,
      bonuses = [],
      deductions = [],
      advancesDeducted = 0,
    } = input;

    // 1. Rémunération de base et sursalaire
    const baseSalary = Math.max(0, employee.baseSalary || 0);
    const sursalaire = Math.max(0, employee.sursalaire || 0);
    const baseAndSursalaire = baseSalary + sursalaire;

    // 2. Calcul des Heures Supplémentaires (CCNI Sénégal)
    const overtimeDetails = OvertimeCalculator.calculate(baseAndSursalaire, overtime);
    const totalOvertimePay = overtimeDetails.totalOvertimePay;

    // 3. Indemnité de transport légale (20 800 FCFA max exonérée)
    const fullTransportAllowance =
      employee.transportAllowance ??
      SENEGAL_PAYROLL_CONSTANTS.LEGAL_TRANSPORT_ALLOWANCE_EXEMPT_LIMIT;

    const actualPresenceDays = presenceDays !== undefined ? presenceDays : totalWorkingDays;
    const proratedTransport =
      baseSalary > 0
        ? Math.round(
            (Math.min(actualPresenceDays, totalWorkingDays) / totalWorkingDays) *
              fullTransportAllowance,
          )
        : 0;

    const transportExemptAmount = Math.min(
      proratedTransport,
      SENEGAL_PAYROLL_CONSTANTS.LEGAL_TRANSPORT_ALLOWANCE_EXEMPT_LIMIT,
    );

    // 4. Primes imposables et non imposables
    let taxableBonuses = 0;
    let nonTaxableBonuses = 0;
    for (const b of bonuses) {
      if (b.isTaxable) {
        taxableBonuses += b.amount;
      } else {
        nonTaxableBonuses += b.amount;
      }
    }

    // 5. Salaire Brut Total
    const grossSalaryTotal =
      baseSalary +
      sursalaire +
      totalOvertimePay +
      proratedTransport +
      taxableBonuses +
      nonTaxableBonuses;

    // 6. Assiettes sociales et fiscales
    // L'indemnité de transport exonérée et les primes non imposables/non cotisables sont soustraites
    const grossCotisable = Math.max(
      0,
      grossSalaryTotal - transportExemptAmount - nonTaxableBonuses,
    );
    const grossTaxable = Math.max(
      0,
      grossSalaryTotal - transportExemptAmount - nonTaxableBonuses,
    );

    // 7. Cotisations sociales (IPRES RG/RCC, CSS PF/AT, CFCE)
    const social = SenegalSocialCalculator.calculate(
      grossCotisable,
      grossTaxable,
      employee.isCadre,
      employee.cssRiskRate,
    );

    // 8. Impôt sur le Revenu (IR) selon CGI Sénégal
    const tax = SenegalTaxCalculator.calculate(
      grossTaxable,
      social.totalEmployeeSocial,
      employee.taxParts,
    );

    // 9. Déductions diverses (Acomptes approuvés + autres retenues)
    const otherDeductionsTotal = deductions.reduce((sum, d) => sum + d.amount, 0);
    const totalDeductions =
      social.totalEmployeeSocial +
      tax.irMonthly +
      advancesDeducted +
      otherDeductionsTotal;

    // 10. Net à payer et coûts employeur
    const netSalaryBeforeTax = Math.max(0, grossSalaryTotal - social.totalEmployeeSocial);
    const netPay = Math.max(0, grossSalaryTotal - totalDeductions);
    const totalEmployerCost = grossSalaryTotal + social.totalEmployerSocial;

    // 11. Construction des lignes détaillées du bulletin
    const lines: PayslipItemLine[] = [];

    // Gains
    lines.push({
      code: '100',
      label: 'Salaire de base',
      base: baseSalary,
      amountEmployee: baseSalary,
    });

    if (sursalaire > 0) {
      lines.push({
        code: '105',
        label: 'Sursalaire conventionnel',
        base: sursalaire,
        amountEmployee: sursalaire,
      });
    }

    if (overtimeDetails.hours15 > 0) {
      lines.push({
        code: '120',
        label: `Heures supplémentaires 15% (${overtimeDetails.hours15}h)`,
        base: overtimeDetails.hourlyRate,
        rateEmployee: 1.15,
        amountEmployee: overtimeDetails.pay15,
      });
    }

    if (overtimeDetails.hours40 > 0) {
      lines.push({
        code: '121',
        label: `Heures supplémentaires 40% (${overtimeDetails.hours40}h)`,
        base: overtimeDetails.hourlyRate,
        rateEmployee: 1.4,
        amountEmployee: overtimeDetails.pay40,
      });
    }

    if (overtimeDetails.hours60 > 0) {
      lines.push({
        code: '122',
        label: `Heures supplémentaires dimanche 60% (${overtimeDetails.hours60}h)`,
        base: overtimeDetails.hourlyRate,
        rateEmployee: 1.6,
        amountEmployee: overtimeDetails.pay60,
      });
    }

    if (overtimeDetails.hours100 > 0) {
      lines.push({
        code: '123',
        label: `Heures supplémentaires nuit/férié 100% (${overtimeDetails.hours100}h)`,
        base: overtimeDetails.hourlyRate,
        rateEmployee: 2.0,
        amountEmployee: overtimeDetails.pay100,
      });
    }

    for (const b of bonuses) {
      lines.push({
        code: b.isTaxable ? '200' : '250',
        label: b.name,
        base: b.amount,
        amountEmployee: b.amount,
      });
    }

    if (proratedTransport > 0) {
      lines.push({
        code: '300',
        label: 'Indemnité légale de transport (exonérée)',
        base: proratedTransport,
        amountEmployee: proratedTransport,
      });
    }

    // Cotisations Retraite (IPRES)
    lines.push({
      code: '500',
      label: 'IPRES Régime Général',
      base: social.ipresRgBase,
      rateEmployee: social.ipresRgEmployeeRate * 100,
      amountEmployee: -social.ipresRgEmployeeAmount,
      rateEmployer: social.ipresRgEmployerRate * 100,
      amountEmployer: social.ipresRgEmployerAmount,
    });

    if (employee.isCadre && social.ipresRccBase > 0) {
      lines.push({
        code: '510',
        label: 'IPRES Régime Complémentaire Cadre (RCC)',
        base: social.ipresRccBase,
        rateEmployee: social.ipresRccEmployeeRate * 100,
        amountEmployee: -social.ipresRccEmployeeAmount,
        rateEmployer: social.ipresRccEmployerRate * 100,
        amountEmployer: social.ipresRccEmployerAmount,
      });
    }

    // Cotisations Sécurité Sociale (CSS)
    lines.push({
      code: '520',
      label: 'CSS Prestations Familiales (PF)',
      base: social.cssPfBase,
      rateEmployer: social.cssPfRate * 100,
      amountEmployer: social.cssPfAmount,
    });

    lines.push({
      code: '530',
      label: 'CSS Accidents du Travail (AT/MP)',
      base: social.cssAtBase,
      rateEmployer: social.cssAtRate * 100,
      amountEmployer: social.cssAtAmount,
    });

    // CFCE
    lines.push({
      code: '540',
      label: 'CFCE Charge Employeur (3%)',
      base: social.cfceBase,
      rateEmployer: social.cfceRate * 100,
      amountEmployer: social.cfceAmount,
    });

    // Impôt sur le Revenu
    if (tax.irMonthly > 0) {
      lines.push({
        code: '600',
        label: `Impôt sur le Revenu (IR - ${tax.taxParts} part${tax.taxParts > 1 ? 's' : ''})`,
        base: tax.netTaxableIncomeMonthly,
        amountEmployee: -tax.irMonthly,
      });
    }

    // Acomptes & Déductions
    if (advancesDeducted > 0) {
      lines.push({
        code: '700',
        label: 'Acompte sur salaire déduit',
        base: advancesDeducted,
        amountEmployee: -advancesDeducted,
      });
    }

    for (const d of deductions) {
      lines.push({
        code: '750',
        label: d.name,
        base: d.amount,
        amountEmployee: -d.amount,
      });
    }

    return {
      employeeId: employee.id,
      month,
      year,
      baseSalary,
      sursalaire,
      transportAllowance: proratedTransport,
      transportExemptAmount,
      totalOvertimePay,
      taxableBonuses,
      nonTaxableBonuses,
      grossSalaryTotal,
      overtimeDetails,
      social,
      tax,
      advancesDeducted,
      otherDeductions: otherDeductionsTotal,
      totalDeductions,
      netSalaryBeforeTax,
      netTaxable: tax.netTaxableIncomeMonthly,
      netPay,
      totalEmployerCost,
      lines,
    };
  }
}
