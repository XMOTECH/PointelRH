import { SENEGAL_PAYROLL_CONSTANTS } from './senegal-constants';
import { OvertimeInput, OvertimeResult } from './payroll-engine.types';

/**
 * Calculateur des heures supplémentaires selon la Convention Collective Nationale
 * Interprofessionnelle (CCNI) du Sénégal.
 */
export class OvertimeCalculator {
  /**
   * Calcule le taux horaire de référence et la rémunération détaillée des heures sup.
   *
   * @param baseSalaryAndSursalaire Somme du salaire de base et de l'éventuel sursalaire
   * @param input Volumes d'heures par catégorie (15%, 40%, 60%, 100%)
   */
  public static calculate(
    baseSalaryAndSursalaire: number,
    input?: OvertimeInput,
  ): OvertimeResult {
    const { LEGAL_MONTHLY_HOURS, OVERTIME_RATES } = SENEGAL_PAYROLL_CONSTANTS;

    // Taux horaire de base
    const hourlyRate =
      baseSalaryAndSursalaire > 0
        ? baseSalaryAndSursalaire / LEGAL_MONTHLY_HOURS
        : 0;

    const hours15 = Math.max(0, input?.hours15 ?? 0);
    const hours40 = Math.max(0, input?.hours40 ?? 0);
    const hours60 = Math.max(0, input?.hours60 ?? 0);
    const hours100 = Math.max(0, input?.hours100 ?? 0);

    const pay15 = Math.round(hours15 * hourlyRate * (1 + OVERTIME_RATES.RATE_15));
    const pay40 = Math.round(hours40 * hourlyRate * (1 + OVERTIME_RATES.RATE_40));
    const pay60 = Math.round(hours60 * hourlyRate * (1 + OVERTIME_RATES.RATE_60));
    const pay100 = Math.round(hours100 * hourlyRate * (1 + OVERTIME_RATES.RATE_100));

    const totalOvertimePay = pay15 + pay40 + pay60 + pay100;

    return {
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      hours15,
      pay15,
      hours40,
      pay40,
      hours60,
      pay60,
      hours100,
      pay100,
      totalOvertimePay,
    };
  }
}
