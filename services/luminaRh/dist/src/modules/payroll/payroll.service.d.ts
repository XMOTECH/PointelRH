import { PrismaService } from '../../prisma/prisma.service';
export declare class PayrollService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getWeekKey;
    getPrePayroll(companyId: string, monthYear?: string): Promise<{
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
    }[]>;
    exportPrePayrollToCsv(companyId: string, monthYear?: string): Promise<string>;
}
