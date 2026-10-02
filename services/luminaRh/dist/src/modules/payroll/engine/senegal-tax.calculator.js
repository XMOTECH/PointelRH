"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenegalTaxCalculator = void 0;
const senegal_constants_1 = require("./senegal-constants");
class SenegalTaxCalculator {
    static calculate(grossTaxable, ipresEmployeeAmount, taxParts = 1.0) {
        const { TAX } = senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS;
        const validParts = Math.min(Math.max(taxParts, TAX.MIN_PARTS), TAX.MAX_PARTS);
        const baseAfterIpres = Math.max(0, grossTaxable - ipresEmployeeAmount);
        const rawExpensesDeduction = baseAfterIpres * TAX.PROFESSIONAL_EXPENSES_RATE;
        const professionalExpensesDeduction = Math.round(Math.min(rawExpensesDeduction, TAX.PROFESSIONAL_EXPENSES_MAX_MONTHLY));
        const netTaxableIncomeMonthly = Math.max(0, baseAfterIpres - professionalExpensesDeduction);
        const netTaxableIncomeAnnual = netTaxableIncomeMonthly * 12;
        const taxablePerPartAnnual = netTaxableIncomeAnnual / validParts;
        let annualTaxPerPart = 0;
        for (const bracket of TAX.ANNUAL_TAX_BRACKETS) {
            if (taxablePerPartAnnual > bracket.min) {
                const taxableInBracket = Math.min(taxablePerPartAnnual, bracket.max) - bracket.min;
                annualTaxPerPart += taxableInBracket * bracket.rate;
            }
        }
        const irAnnual = Math.round(annualTaxPerPart * validParts);
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
exports.SenegalTaxCalculator = SenegalTaxCalculator;
//# sourceMappingURL=senegal-tax.calculator.js.map