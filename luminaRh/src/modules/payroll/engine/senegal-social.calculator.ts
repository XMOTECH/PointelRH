import { SENEGAL_PAYROLL_CONSTANTS } from './senegal-constants';
import { SocialContributionsBreakdown } from './payroll-engine.types';

/**
 * Calculateur des cotisations sociales et patronales selon le droit sénégalais (IPRES, CSS, CFCE)
 * Fonctions pures, déterministes, sans effet de bord.
 */
export class SenegalSocialCalculator {
  /**
   * Calcule le détail complet des cotisations sociales pour un salaire cotisable donné.
   *
   * @param grossCotisable Assiette brute cotisable (Brut total - indemnités de transport exonérées)
   * @param grossTaxable Assiette brute imposable (base de la CFCE)
   * @param isCadre Indique si le salarié bénéficie du statut Cadre (CCNI art. 82)
   * @param customCssAtRate Taux spécifique d'accident du travail (défaut 3%)
   */
  public static calculate(
    grossCotisable: number,
    grossTaxable: number,
    isCadre: boolean = false,
    customCssAtRate?: number,
  ): SocialContributionsBreakdown {
    const { IPRES, CSS, CFCE } = SENEGAL_PAYROLL_CONSTANTS;

    // 1. IPRES Régime Général (RG) - Plafond mensuel 432 000 FCFA
    const ipresRgBase = Math.min(Math.max(0, grossCotisable), IPRES.RG.CEILING_MONTHLY);
    const ipresRgEmployeeAmount = Math.round(ipresRgBase * IPRES.RG.EMPLOYEE_RATE);
    const ipresRgEmployerAmount = Math.round(ipresRgBase * IPRES.RG.EMPLOYER_RATE);

    // 2. IPRES Régime Complémentaire Cadres (RCC) - Tranche entre 432 000 et 1 296 000 FCFA
    let ipresRccBase = 0;
    let ipresRccEmployeeAmount = 0;
    let ipresRccEmployerAmount = 0;

    if (isCadre && grossCotisable > IPRES.RCC.FLOOR_MONTHLY) {
      const maxRccTranche = IPRES.RCC.CEILING_MONTHLY - IPRES.RCC.FLOOR_MONTHLY; // 864 000 FCFA
      ipresRccBase = Math.min(grossCotisable - IPRES.RCC.FLOOR_MONTHLY, maxRccTranche);
      ipresRccEmployeeAmount = Math.round(ipresRccBase * IPRES.RCC.EMPLOYEE_RATE);
      ipresRccEmployerAmount = Math.round(ipresRccBase * IPRES.RCC.EMPLOYER_RATE);
    }

    // 3. CSS Prestations Familiales (PF) - 100% Employeur, plafond 63 000 FCFA
    const cssPfBase = Math.min(Math.max(0, grossCotisable), CSS.CEILING_MONTHLY);
    const cssPfAmount = Math.round(cssPfBase * CSS.PF_RATE);

    // 4. CSS Accidents du Travail (AT) - 100% Employeur, plafond 63 000 FCFA
    const cssAtRate = customCssAtRate ?? CSS.AT_RATES.DEFAULT;
    const cssAtBase = Math.min(Math.max(0, grossCotisable), CSS.CEILING_MONTHLY);
    const cssAtAmount = Math.round(cssAtBase * cssAtRate);

    // 5. CFCE (Contribution Forfaitaire à la Charge des Employeurs) - 100% Employeur (3%)
    const cfceBase = Math.max(0, grossTaxable);
    const cfceAmount = Math.round(cfceBase * CFCE.RATE);

    // Totaux
    const totalEmployeeSocial = ipresRgEmployeeAmount + ipresRccEmployeeAmount;
    const totalEmployerSocial =
      ipresRgEmployerAmount +
      ipresRccEmployerAmount +
      cssPfAmount +
      cssAtAmount +
      cfceAmount;

    return {
      grossCotisable,
      ipresRgBase,
      ipresRgEmployeeRate: IPRES.RG.EMPLOYEE_RATE,
      ipresRgEmployeeAmount,
      ipresRgEmployerRate: IPRES.RG.EMPLOYER_RATE,
      ipresRgEmployerAmount,
      ipresRccBase,
      ipresRccEmployeeRate: isCadre ? IPRES.RCC.EMPLOYEE_RATE : 0,
      ipresRccEmployeeAmount,
      ipresRccEmployerRate: isCadre ? IPRES.RCC.EMPLOYER_RATE : 0,
      ipresRccEmployerAmount,
      cssPfBase,
      cssPfRate: CSS.PF_RATE,
      cssPfAmount,
      cssAtBase,
      cssAtRate,
      cssAtAmount,
      cfceBase,
      cfceRate: CFCE.RATE,
      cfceAmount,
      totalEmployeeSocial,
      totalEmployerSocial,
    };
  }
}
