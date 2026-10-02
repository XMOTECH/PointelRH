"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenegalSocialCalculator = void 0;
const senegal_constants_1 = require("./senegal-constants");
class SenegalSocialCalculator {
    static calculate(grossCotisable, grossTaxable, isCadre = false, customCssAtRate) {
        const { IPRES, CSS, CFCE } = senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS;
        const ipresRgBase = Math.min(Math.max(0, grossCotisable), IPRES.RG.CEILING_MONTHLY);
        const ipresRgEmployeeAmount = Math.round(ipresRgBase * IPRES.RG.EMPLOYEE_RATE);
        const ipresRgEmployerAmount = Math.round(ipresRgBase * IPRES.RG.EMPLOYER_RATE);
        let ipresRccBase = 0;
        let ipresRccEmployeeAmount = 0;
        let ipresRccEmployerAmount = 0;
        if (isCadre && grossCotisable > IPRES.RCC.FLOOR_MONTHLY) {
            const maxRccTranche = IPRES.RCC.CEILING_MONTHLY - IPRES.RCC.FLOOR_MONTHLY;
            ipresRccBase = Math.min(grossCotisable - IPRES.RCC.FLOOR_MONTHLY, maxRccTranche);
            ipresRccEmployeeAmount = Math.round(ipresRccBase * IPRES.RCC.EMPLOYEE_RATE);
            ipresRccEmployerAmount = Math.round(ipresRccBase * IPRES.RCC.EMPLOYER_RATE);
        }
        const cssPfBase = Math.min(Math.max(0, grossCotisable), CSS.CEILING_MONTHLY);
        const cssPfAmount = Math.round(cssPfBase * CSS.PF_RATE);
        const cssAtRate = customCssAtRate ?? CSS.AT_RATES.DEFAULT;
        const cssAtBase = Math.min(Math.max(0, grossCotisable), CSS.CEILING_MONTHLY);
        const cssAtAmount = Math.round(cssAtBase * cssAtRate);
        const cfceBase = Math.max(0, grossTaxable);
        const cfceAmount = Math.round(cfceBase * CFCE.RATE);
        const totalEmployeeSocial = ipresRgEmployeeAmount + ipresRccEmployeeAmount;
        const totalEmployerSocial = ipresRgEmployerAmount +
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
exports.SenegalSocialCalculator = SenegalSocialCalculator;
//# sourceMappingURL=senegal-social.calculator.js.map