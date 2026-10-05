"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENEGAL_PAYROLL_CONSTANTS = void 0;
exports.SENEGAL_PAYROLL_CONSTANTS = {
    LEGAL_MONTHLY_HOURS: 173.3333,
    STANDARD_WORKING_DAYS: 22,
    LEGAL_TRANSPORT_ALLOWANCE_EXEMPT_LIMIT: 20800,
    IPRES: {
        RG: {
            CEILING_MONTHLY: 432000,
            CEILING_ANNUAL: 5184000,
            EMPLOYEE_RATE: 0.056,
            EMPLOYER_RATE: 0.084,
            TOTAL_RATE: 0.14,
        },
        RCC: {
            FLOOR_MONTHLY: 432000,
            CEILING_MONTHLY: 1296000,
            EMPLOYEE_RATE: 0.024,
            EMPLOYER_RATE: 0.036,
            TOTAL_RATE: 0.06,
        },
    },
    CSS: {
        CEILING_MONTHLY: 63000,
        PF_RATE: 0.07,
        AT_RATES: {
            LOW: 0.01,
            MEDIUM: 0.03,
            HIGH: 0.05,
            DEFAULT: 0.03,
        },
    },
    CFCE: {
        RATE: 0.03,
    },
    TAX: {
        PROFESSIONAL_EXPENSES_RATE: 0.3,
        PROFESSIONAL_EXPENSES_MAX_MONTHLY: 75000,
        PROFESSIONAL_EXPENSES_MAX_ANNUAL: 900000,
        MIN_PARTS: 1.0,
        MAX_PARTS: 5.0,
        ANNUAL_TAX_BRACKETS: [
            { min: 0, max: 630000, rate: 0.0 },
            { min: 630000, max: 1500000, rate: 0.2 },
            { min: 1500000, max: 4000000, rate: 0.3 },
            { min: 4000000, max: 8000000, rate: 0.35 },
            { min: 8000000, max: 13500000, rate: 0.37 },
            { min: 13500000, max: Infinity, rate: 0.4 },
        ],
    },
    OVERTIME_RATES: {
        RATE_15: 0.15,
        RATE_40: 0.4,
        RATE_60: 0.6,
        RATE_100: 1.0,
    },
};
//# sourceMappingURL=senegal-constants.js.map