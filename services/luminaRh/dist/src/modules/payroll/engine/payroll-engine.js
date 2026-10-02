"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenegalesePayrollEngine = void 0;
const senegal_constants_1 = require("./senegal-constants");
const senegal_social_calculator_1 = require("./senegal-social.calculator");
const senegal_tax_calculator_1 = require("./senegal-tax.calculator");
const overtime_calculator_1 = require("./overtime.calculator");
class SenegalesePayrollEngine {
    static calculate(input) {
        const { employee, month, year, presenceDays, totalWorkingDays = senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS, overtime, bonuses = [], deductions = [], advancesDeducted = 0, } = input;
        const baseSalary = Math.max(0, employee.baseSalary || 0);
        const sursalaire = Math.max(0, employee.sursalaire || 0);
        const baseAndSursalaire = baseSalary + sursalaire;
        const overtimeDetails = overtime_calculator_1.OvertimeCalculator.calculate(baseAndSursalaire, overtime);
        const totalOvertimePay = overtimeDetails.totalOvertimePay;
        const fullTransportAllowance = employee.transportAllowance ??
            senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS.LEGAL_TRANSPORT_ALLOWANCE_EXEMPT_LIMIT;
        const actualPresenceDays = presenceDays !== undefined ? presenceDays : totalWorkingDays;
        const proratedTransport = baseSalary > 0
            ? Math.round((Math.min(actualPresenceDays, totalWorkingDays) / totalWorkingDays) *
                fullTransportAllowance)
            : 0;
        const transportExemptAmount = Math.min(proratedTransport, senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS.LEGAL_TRANSPORT_ALLOWANCE_EXEMPT_LIMIT);
        let taxableBonuses = 0;
        let nonTaxableBonuses = 0;
        for (const b of bonuses) {
            if (b.isTaxable) {
                taxableBonuses += b.amount;
            }
            else {
                nonTaxableBonuses += b.amount;
            }
        }
        const grossSalaryTotal = baseSalary +
            sursalaire +
            totalOvertimePay +
            proratedTransport +
            taxableBonuses +
            nonTaxableBonuses;
        const grossCotisable = Math.max(0, grossSalaryTotal - transportExemptAmount - nonTaxableBonuses);
        const grossTaxable = Math.max(0, grossSalaryTotal - transportExemptAmount - nonTaxableBonuses);
        const social = senegal_social_calculator_1.SenegalSocialCalculator.calculate(grossCotisable, grossTaxable, employee.isCadre, employee.cssRiskRate);
        const tax = senegal_tax_calculator_1.SenegalTaxCalculator.calculate(grossTaxable, social.totalEmployeeSocial, employee.taxParts);
        const otherDeductionsTotal = deductions.reduce((sum, d) => sum + d.amount, 0);
        const totalDeductions = social.totalEmployeeSocial +
            tax.irMonthly +
            advancesDeducted +
            otherDeductionsTotal;
        const netSalaryBeforeTax = Math.max(0, grossSalaryTotal - social.totalEmployeeSocial);
        const netPay = Math.max(0, grossSalaryTotal - totalDeductions);
        const totalEmployerCost = grossSalaryTotal + social.totalEmployerSocial;
        const lines = [];
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
        lines.push({
            code: '540',
            label: 'CFCE Charge Employeur (3%)',
            base: social.cfceBase,
            rateEmployer: social.cfceRate * 100,
            amountEmployer: social.cfceAmount,
        });
        if (tax.irMonthly > 0) {
            lines.push({
                code: '600',
                label: `Impôt sur le Revenu (IR - ${tax.taxParts} part${tax.taxParts > 1 ? 's' : ''})`,
                base: tax.netTaxableIncomeMonthly,
                amountEmployee: -tax.irMonthly,
            });
        }
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
exports.SenegalesePayrollEngine = SenegalesePayrollEngine;
//# sourceMappingURL=payroll-engine.js.map