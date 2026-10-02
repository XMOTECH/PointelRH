import { PrismaService } from '../../../prisma/prisma.service';
export interface ComplianceViolation {
    rule: 'LEAVE_CONFLICT' | 'SHIFT_OVERLAP' | 'DAILY_REST_INSUFFICIENT' | 'MAX_DAILY_HOURS' | 'MAX_WEEKLY_HOURS' | 'CONSECUTIVE_DAYS';
    severity: 'ERROR' | 'WARNING';
    message: string;
    shiftId?: string;
    employeeId?: string;
    date?: string;
    details?: Record<string, any>;
}
export interface ShiftTimeBlock {
    id?: string;
    employeeId?: string | null;
    date: Date | string;
    startTime: string;
    endTime: string;
    breakMinutes?: number;
}
export declare class PlanningComplianceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    timeToMinutes(timeStr: string): number;
    calculateGrossMinutes(startTime: string, endTime: string): number;
    calculateNetMinutes(startTime: string, endTime: string, breakMinutes?: number): number;
    doShiftsOverlap(shiftA: {
        startTime: string;
        endTime: string;
    }, shiftB: {
        startTime: string;
        endTime: string;
    }): boolean;
    calculateRestMinutesBetweenDays(previousEndTime: string, nextStartTime: string): number;
    validateSingleShift(companyId: string, shift: ShiftTimeBlock, excludeShiftId?: string): Promise<ComplianceViolation[]>;
    evaluateWeeklyCompliance(companyId: string, weekStartDate: Date, weekEndDate: Date): Promise<ComplianceViolation[]>;
}
