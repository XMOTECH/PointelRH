export declare const SENEGAL_PAYROLL_CONSTANTS: {
    readonly LEGAL_MONTHLY_HOURS: 173.3333;
    readonly STANDARD_WORKING_DAYS: 22;
    readonly LEGAL_TRANSPORT_ALLOWANCE_EXEMPT_LIMIT: 20800;
    readonly IPRES: {
        readonly RG: {
            readonly CEILING_MONTHLY: 432000;
            readonly CEILING_ANNUAL: 5184000;
            readonly EMPLOYEE_RATE: 0.056;
            readonly EMPLOYER_RATE: 0.084;
            readonly TOTAL_RATE: 0.14;
        };
        readonly RCC: {
            readonly FLOOR_MONTHLY: 432000;
            readonly CEILING_MONTHLY: 1296000;
            readonly EMPLOYEE_RATE: 0.024;
            readonly EMPLOYER_RATE: 0.036;
            readonly TOTAL_RATE: 0.06;
        };
    };
    readonly CSS: {
        readonly CEILING_MONTHLY: 63000;
        readonly PF_RATE: 0.07;
        readonly AT_RATES: {
            readonly LOW: 0.01;
            readonly MEDIUM: 0.03;
            readonly HIGH: 0.05;
            readonly DEFAULT: 0.03;
        };
    };
    readonly CFCE: {
        readonly RATE: 0.03;
    };
    readonly TAX: {
        readonly PROFESSIONAL_EXPENSES_RATE: 0.3;
        readonly PROFESSIONAL_EXPENSES_MAX_MONTHLY: 75000;
        readonly PROFESSIONAL_EXPENSES_MAX_ANNUAL: 900000;
        readonly MIN_PARTS: 1;
        readonly MAX_PARTS: 5;
        readonly ANNUAL_TAX_BRACKETS: readonly [{
            readonly min: 0;
            readonly max: 630000;
            readonly rate: 0;
        }, {
            readonly min: 630000;
            readonly max: 1500000;
            readonly rate: 0.2;
        }, {
            readonly min: 1500000;
            readonly max: 4000000;
            readonly rate: 0.3;
        }, {
            readonly min: 4000000;
            readonly max: 8000000;
            readonly rate: 0.35;
        }, {
            readonly min: 8000000;
            readonly max: 13500000;
            readonly rate: 0.37;
        }, {
            readonly min: 13500000;
            readonly max: number;
            readonly rate: 0.4;
        }];
    };
    readonly OVERTIME_RATES: {
        readonly RATE_15: 0.15;
        readonly RATE_40: 0.4;
        readonly RATE_60: 0.6;
        readonly RATE_100: 1;
    };
};
