import { TaxBreakdown } from './payroll-engine.types';
export declare class SenegalTaxCalculator {
    static calculate(grossTaxable: number, ipresEmployeeAmount: number, taxParts?: number): TaxBreakdown;
}
