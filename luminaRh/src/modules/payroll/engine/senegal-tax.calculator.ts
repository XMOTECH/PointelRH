import { SENEGAL_PAYROLL_CONSTANTS } from './senegal-constants';
import { TaxBreakdown } from './payroll-engine.types';

/**
 * Calculateur de l'Impôt sur le Revenu (IR) du Sénégal selon le CGI (art. 37 et 38).
 * Système du quotient familial par parts fiscales (1.0 à 5.0 parts) et barème progressif par tranches.
 */
export class SenegalTaxCalculator {
  /**
   * Calcule le montant précis de l'IR retenu à la source pour un mois donné.
   *
   * @param grossTaxable Salaire brut imposable (Brut total déduction faite des indemnités représentatives de frais exonérées)
   * @param ipresEmployeeAmount Cotisations de retraite salariales payées pour le mois (déductibles)
   * @param taxParts Nombre de parts fiscales (déterminé lors de l'onboarding, entre 1.0 et 5.0)
   */
  public static calculate(
    grossTaxable: number,
    ipresEmployeeAmount: number,
    taxParts: number = 1.0,
  ): TaxBreakdown {
    const { TAX } = SENEGAL_PAYROLL_CONSTANTS;

    // 1. Validation et normalisation du nombre de parts (CGI art. 37 : 1.0 à 5.0)
    const validParts = Math.min(Math.max(taxParts, TAX.MIN_PARTS), TAX.MAX_PARTS);

    // 2. Déduction des cotisations IPRES salariales
    const baseAfterIpres = Math.max(0, grossTaxable - ipresEmployeeAmount);

    // 3. Déduction pour frais professionnels (CGI art. 38 : 30% plafonné à 75 000 FCFA/mois)
    const rawExpensesDeduction = baseAfterIpres * TAX.PROFESSIONAL_EXPENSES_RATE;
    const professionalExpensesDeduction = Math.round(
      Math.min(rawExpensesDeduction, TAX.PROFESSIONAL_EXPENSES_MAX_MONTHLY),
    );

    // 4. Revenu Net Imposable (RNI) mensuel
    const netTaxableIncomeMonthly = Math.max(0, baseAfterIpres - professionalExpensesDeduction);

    // 5. Annualisation pour application du barème progressif du CGI
    const netTaxableIncomeAnnual = netTaxableIncomeMonthly * 12;

    // 6. Quotient familial : calcul du revenu annuel par part fiscale
    const taxablePerPartAnnual = netTaxableIncomeAnnual / validParts;

    // 7. Application du barème progressif par tranche sur le revenu par part
    let annualTaxPerPart = 0;

    for (const bracket of TAX.ANNUAL_TAX_BRACKETS) {
      if (taxablePerPartAnnual > bracket.min) {
        const taxableInBracket = Math.min(taxablePerPartAnnual, bracket.max) - bracket.min;
        annualTaxPerPart += taxableInBracket * bracket.rate;
      }
    }

    // 8. Reconstitution de l'impôt annuel total (Impôt par part x Nombre de parts)
    const irAnnual = Math.round(annualTaxPerPart * validParts);

    // 9. Mensualisation de l'impôt retenu à la source
    const irMonthly = Math.round(irAnnual / 12);

    return {
      grossTaxable,
      ipresDeduction: ipresEmployeeAmount,
      professionalExpensesDeduction,
      netTaxableIncomeMonthly,
      netTaxableIncomeAnnual,
      taxParts: validParts,
      taxablePerPartAnnual: Math.round(taxablePerPartAnnual),
      irAnnual,
      irMonthly,
    };
  }
}
