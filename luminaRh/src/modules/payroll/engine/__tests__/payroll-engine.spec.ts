import { SenegalesePayrollEngine } from '../payroll-engine';
import { SenegalSocialCalculator } from '../senegal-social.calculator';
import { SenegalTaxCalculator } from '../senegal-tax.calculator';
import { OvertimeCalculator } from '../overtime.calculator';
import { SENEGAL_PAYROLL_CONSTANTS } from '../senegal-constants';

describe('Senegalese Payroll Engine (Domain Pure Engine)', () => {
  describe('OvertimeCalculator', () => {
    it('should calculate hourly rate and overtime brackets correctly', () => {
      // Base: 173 333 FCFA => hourly rate = ~1000 FCFA/h
      const result = OvertimeCalculator.calculate(173333.3, {
        hours15: 10,
        hours40: 5,
        hours60: 2,
        hours100: 1,
      });

      expect(result.hourlyRate).toBeCloseTo(1000, 0);
      // 10h * 1000 * 1.15 = 11 500 FCFA
      expect(result.pay15).toBe(11500);
      // 5h * 1000 * 1.40 = 7 000 FCFA
      expect(result.pay40).toBe(7000);
      // 2h * 1000 * 1.60 = 3 200 FCFA
      expect(result.pay60).toBe(3200);
      // 1h * 1000 * 2.00 = 2 000 FCFA
      expect(result.pay100).toBe(2000);
      expect(result.totalOvertimePay).toBe(23700);
    });
  });

  describe('SenegalSocialCalculator', () => {
    it('should cap IPRES RG at 432,000 FCFA and CSS at 63,000 FCFA', () => {
      // Non-cadre employee with 600,000 FCFA cotisable
      const social = SenegalSocialCalculator.calculate(600000, 600000, false);

      // IPRES RG: 432 000 * 5.6% = 24 192 FCFA
      expect(social.ipresRgBase).toBe(432000);
      expect(social.ipresRgEmployeeAmount).toBe(24192);
      // IPRES RG Patronal: 432 000 * 8.4% = 36 288 FCFA
      expect(social.ipresRgEmployerAmount).toBe(36288);

      // Non-cadre => RCC should be 0
      expect(social.ipresRccBase).toBe(0);
      expect(social.ipresRccEmployeeAmount).toBe(0);

      // CSS: Capped at 63 000 FCFA
      // PF: 63 000 * 7% = 4 410 FCFA
      expect(social.cssPfBase).toBe(63000);
      expect(social.cssPfAmount).toBe(4410);

      // AT (3%): 63 000 * 3% = 1 890 FCFA
      expect(social.cssAtBase).toBe(63000);
      expect(social.cssAtAmount).toBe(1890);

      // CFCE: 600 000 * 3% = 18 000 FCFA
      expect(social.cfceBase).toBe(600000);
      expect(social.cfceAmount).toBe(18000);

      expect(social.totalEmployeeSocial).toBe(24192);
      expect(social.totalEmployerSocial).toBe(36288 + 4410 + 1890 + 18000);
    });

    it('should apply IPRES RCC tranche for Cadres', () => {
      // Cadre with 1,500,000 FCFA
      const social = SenegalSocialCalculator.calculate(1500000, 1500000, true);

      expect(social.ipresRgBase).toBe(432000);
      expect(social.ipresRgEmployeeAmount).toBe(24192);

      // RCC tranche: capped at 864 000 FCFA (1 296 000 - 432 000)
      expect(social.ipresRccBase).toBe(864000);
      // 864 000 * 2.4% = 20 736 FCFA
      expect(social.ipresRccEmployeeAmount).toBe(20736);
      // 864 000 * 3.6% = 31 104 FCFA
      expect(social.ipresRccEmployerAmount).toBe(31104);

      expect(social.totalEmployeeSocial).toBe(24192 + 20736);
    });
  });

  describe('SenegalTaxCalculator', () => {
    it('should respect professional expenses deduction cap of 75,000 FCFA/month', () => {
      // High earner: baseAfterIpres = 1,000,000 FCFA. 30% would be 300,000 FCFA -> must be capped at 75,000 FCFA
      const tax = SenegalTaxCalculator.calculate(1000000, 0, 1.0);
      expect(tax.professionalExpensesDeduction).toBe(75000);
      expect(tax.netTaxableIncomeMonthly).toBe(925000);
    });

    it('should reduce income tax significantly when tax parts increase (Quotient Familial)', () => {
      const grossTaxable = 500000;
      const ipres = 24192;

      // 1.0 Part (Célibataire sans enfant)
      const tax1Part = SenegalTaxCalculator.calculate(grossTaxable, ipres, 1.0);

      // 3.0 Parts (Marié 4 enfants)
      const tax3Parts = SenegalTaxCalculator.calculate(grossTaxable, ipres, 3.0);

      // 5.0 Parts (Plafond légal, ex: 12 enfants)
      const tax5Parts = SenegalTaxCalculator.calculate(grossTaxable, ipres, 5.0);

      expect(tax1Part.irMonthly).toBeGreaterThan(tax3Parts.irMonthly);
      expect(tax3Parts.irMonthly).toBeGreaterThan(tax5Parts.irMonthly);
      // 5 parts on 500k typically results in very low or zero IR due to progressive brackets
      expect(tax5Parts.irMonthly).toBeLessThan(tax1Part.irMonthly / 3);
    });
  });

  describe('Full Payslip Calculation Scenarios', () => {
    it('Scenario 1: Ouvrier d\'usine avec transport légal et acomptes', () => {
      const payslip = SenegalesePayrollEngine.calculate({
        employee: {
          id: 'emp-1',
          firstName: 'Amadou',
          lastName: 'Diallo',
          contractType: 'cdi',
          isCadre: false,
          baseSalary: 200000,
          taxParts: 1.5,
          transportAllowance: 20800,
        },
        month: 6,
        year: 2026,
        presenceDays: 22,
        advancesDeducted: 30000,
      });

      // Brut total = 200 000 (Base) + 20 800 (Transport) = 220 800 FCFA
      expect(payslip.grossSalaryTotal).toBe(220800);
      // Cotisable = 200 000 (transport 20 800 exonéré)
      expect(payslip.social.grossCotisable).toBe(200000);

      // IPRES RG: 200 000 * 5.6% = 11 200 FCFA
      expect(payslip.social.ipresRgEmployeeAmount).toBe(11200);

      // Net Pay = Gross - IPRES - IR - Acompte
      expect(payslip.advancesDeducted).toBe(30000);
      expect(payslip.netPay).toBe(
        payslip.grossSalaryTotal -
          payslip.social.totalEmployeeSocial -
          payslip.tax.irMonthly -
          30000,
      );

      // Vérification des lignes de bulletin
      expect(payslip.lines.some((l) => l.code === '100' && l.amountEmployee === 200000)).toBe(true);
      expect(payslip.lines.some((l) => l.code === '300' && l.amountEmployee === 20800)).toBe(true);
      expect(payslip.lines.some((l) => l.code === '500' && l.amountEmployee === -11200)).toBe(true);
      expect(payslip.lines.some((l) => l.code === '700' && l.amountEmployee === -30000)).toBe(true);
    });

    it('Scenario 2: Candidat Onboardé réel (Moussa Ba - 250,000 FCFA, 5.0 parts fiscales)', () => {
      const payslip = SenegalesePayrollEngine.calculate({
        employee: {
          id: 'emp-moussa-ba',
          firstName: 'Moussa',
          lastName: 'Ba',
          contractType: 'cdd',
          isCadre: false,
          baseSalary: 250000,
          taxParts: 5.0, // 12 enfants => Plafond 5.0 parts
          transportAllowance: 20800,
        },
        month: 10,
        year: 2026,
      });

      expect(payslip.grossSalaryTotal).toBe(270800);
      // IPRES RG: 250 000 * 5.6% = 14 000 FCFA
      expect(payslip.social.ipresRgEmployeeAmount).toBe(14000);

      // Avec 5 parts fiscales sur un RNI mensuel modéré, l'IR annuel divisé par 5 tombe sous le seuil d'exonération de 630 000 FCFA/an
      // RNI = (250 000 - 14 000) - 30% (70 800) = 165 200 FCFA/mois = 1 982 400 FCFA/an
      // Par part = 1 982 400 / 5 = 396 480 FCFA < 630 000 FCFA => 0% IR !
      expect(payslip.tax.irMonthly).toBe(0);

      // Donc Net à payer = 270 800 - 14 000 = 256 800 FCFA net en poche
      expect(payslip.netPay).toBe(256800);
    });
  });
});
