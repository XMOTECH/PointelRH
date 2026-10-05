import { PrismaService } from '../../prisma/prisma.service';
import { AddPayrollVariableDto } from './dto/add-payroll-variable.dto';
export declare class PayrollService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getWeekKey;
    generatePayrollRun(companyId: string, month: number, year: number, userId?: string): Promise<any>;
    getPayrollPeriods(companyId: string): Promise<any>;
    getPayrollPeriod(companyId: string, periodId: string): Promise<any>;
    getPayslip(companyId: string, payslipId: string): Promise<any>;
    private formatPayslip;
    private formatPeriod;
    addVariable(companyId: string, employeeId: string, month: number, year: number, dto: AddPayrollVariableDto): Promise<any>;
    validatePeriod(companyId: string, periodId: string, userId: string): Promise<any>;
    markPeriodAsPaid(companyId: string, periodId: string): Promise<any>;
    exportBankTransfer(companyId: string, periodId: string): Promise<string>;
    exportMobileMoney(companyId: string, periodId: string): Promise<string>;
    getPrePayroll(companyId: string, monthYear?: string): Promise<any>;
    exportPrePayrollToCsv(companyId: string, monthYear?: string): Promise<string>;
}
