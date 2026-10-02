import type { FastifyReply } from 'fastify';
import { PayrollService } from './payroll.service';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { AddPayrollVariableDto } from './dto/add-payroll-variable.dto';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    generatePayrollRun(companyId: string, userId: string, dto: GeneratePayrollDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getPayrollPeriods(companyId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getPayrollPeriod(companyId: string, periodId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    validatePeriod(companyId: string, userId: string, periodId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    markPeriodAsPaid(companyId: string, periodId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    exportBankTransfer(companyId: string, periodId: string, res: FastifyReply): Promise<string>;
    exportMobileMoney(companyId: string, periodId: string, res: FastifyReply): Promise<string>;
    getPayslip(companyId: string, payslipId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    addVariable(companyId: string, body: {
        employeeId: string;
        month: number;
        year: number;
        dto: AddPayrollVariableDto;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getPrePayroll(companyId: string, monthYear?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    exportCsv(companyId: string, monthYear: string, res: FastifyReply): Promise<string>;
}
