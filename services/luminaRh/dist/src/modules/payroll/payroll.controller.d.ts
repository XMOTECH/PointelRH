import type { Response } from 'express';
import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    getPrePayroll(companyId: string, monthYear?: string): Promise<{
        success: boolean;
        data: {
            employee_id: string;
            first_name: string;
            last_name: string;
            email: string;
            department: string;
            base_salary: number;
            presence_days: number;
            overtime_15_hours: number;
            overtime_40_hours: number;
            overtime_60_hours: number;
            overtime_pay: number;
            transport_allowance: number;
            advances_deducted: number;
            net_salary_estimate: number;
        }[];
    }>;
    exportCsv(companyId: string, monthYear: string, res: Response): Promise<void>;
}
