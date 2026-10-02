/**
 * Paramètres légaux et plafonds officiels de la République du Sénégal
 * Références :
 * - Code Général des Impôts (CGI 2013 révisé art. 37 et 38)
 * - Convention Collective Nationale Interprofessionnelle (CCNI)
 * - Règlements IPRES (Régime Général & Régime Complémentaire Cadres)
 * - Caisse de Sécurité Sociale (CSS - Prestations Familiales & Accidents du Travail)
 */

export const SENEGAL_PAYROLL_CONSTANTS = {
  // Base horaire légale mensuelle (40h/semaine * 52 semaines / 12 mois)
  LEGAL_MONTHLY_HOURS: 173.3333,

  // Nombre moyen standard de jours ouvrés par mois
  STANDARD_WORKING_DAYS: 22,

  // Indemnité légale de transport (CCNI) exonérée d'impôt et de charges
  LEGAL_TRANSPORT_ALLOWANCE_EXEMPT_LIMIT: 20800,

  // ==========================================
  // RETRAITE - IPRES
  // ==========================================
  IPRES: {
    // Régime Général (RG) : Tout salarié
    RG: {
      CEILING_MONTHLY: 432000, // Plafond mensuel 432 000 FCFA
      CEILING_ANNUAL: 5184000,
      EMPLOYEE_RATE: 0.056, // 5.6%
      EMPLOYER_RATE: 0.084, // 8.4%
      TOTAL_RATE: 0.14, // 14%
    },
    // Régime Complémentaire Cadre (RCC) : Cadres uniquement (tranche supérieure)
    RCC: {
      FLOOR_MONTHLY: 432000, // Commence au plafond du RG
      CEILING_MONTHLY: 1296000, // Plafonné à 3 fois le plafond RG (1 296 000 FCFA)
      EMPLOYEE_RATE: 0.024, // 2.4% (taux standard contractuel)
      EMPLOYER_RATE: 0.036, // 3.6%
      TOTAL_RATE: 0.06, // 6%
    },
  },

  // ==========================================
  // SÉCURITÉ SOCIALE - CSS (100% Patronal)
  // ==========================================
  CSS: {
    // Plafond commun d'assiette mensuelle pour la CSS : 63 000 FCFA
    CEILING_MONTHLY: 63000,
    // Prestations Familiales (PF)
    PF_RATE: 0.07, // 7.0%
    // Accidents du Travail et Maladies Professionnelles (AT/MP) selon risque
    AT_RATES: {
      LOW: 0.01, // 1% (Bureaux, tertiaire, télétravail)
      MEDIUM: 0.03, // 3% (Commerce, logistique, ateliers légers)
      HIGH: 0.05, // 5% (Mines, usines lourdes, chimie, chantiers BTP)
      DEFAULT: 0.03,
    },
  },

  // ==========================================
  // CONTRIBUTION FORFAITAIRE CHARGE EMPLOYEUR (CFCE)
  // ==========================================
  CFCE: {
    RATE: 0.03, // 3.0% sur le salaire brut imposable (personnel national sénégalais)
  },

  // ==========================================
  // IMPÔT SUR LE REVENU - CGI SÉNÉGAL
  // ==========================================
  TAX: {
    // Abattement pour frais professionnels (CGI art. 38)
    PROFESSIONAL_EXPENSES_RATE: 0.3, // 30%
    PROFESSIONAL_EXPENSES_MAX_MONTHLY: 75000, // Max 75 000 FCFA / mois (900 000 FCFA / an)
    PROFESSIONAL_EXPENSES_MAX_ANNUAL: 900000,

    // Parts fiscales (Quotient familial - CGI art. 37)
    MIN_PARTS: 1.0,
    MAX_PARTS: 5.0,

    // Barème progressif annuel officiel par tranche
    ANNUAL_TAX_BRACKETS: [
      { min: 0, max: 630000, rate: 0.0 }, // 0 à 630 000 : 0%
      { min: 630000, max: 1500000, rate: 0.2 }, // 630 001 à 1 500 000 : 20%
      { min: 1500000, max: 4000000, rate: 0.3 }, // 1 500 001 à 4 000 000 : 30%
      { min: 4000000, max: 8000000, rate: 0.35 }, // 4 000 001 à 8 000 000 : 35%
      { min: 8000000, max: 13500000, rate: 0.37 }, // 8 000 001 à 13 500 000 : 37%
      { min: 13500000, max: Infinity, rate: 0.4 }, // Au-delà de 13 500 000 : 40%
    ],
  },

  // ==========================================
  // HEURES SUPPLÉMENTAIRES (CCNI SÉNÉGAL)
  // ==========================================
  OVERTIME_RATES: {
    RATE_15: 0.15, // +15% (de la 41e à la 48e heure de la semaine)
    RATE_40: 0.4, // +40% (au-delà de la 48e heure de la semaine)
    RATE_60: 0.6, // +60% (dimanches et jours fériés de jour)
    RATE_100: 1.0, // +100% (dimanches et jours fériés de nuit)
  },
} as const;
