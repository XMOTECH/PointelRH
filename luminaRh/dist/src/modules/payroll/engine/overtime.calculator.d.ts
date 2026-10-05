import { OvertimeInput, OvertimeResult } from './payroll-engine.types';
export declare class OvertimeCalculator {
    static calculate(baseSalaryAndSursalaire: number, input?: OvertimeInput): OvertimeResult;
}
