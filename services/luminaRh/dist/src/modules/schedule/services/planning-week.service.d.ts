import { PrismaService } from '../../../prisma/prisma.service';
import { PlanningComplianceService, ComplianceViolation } from './planning-compliance.service';
import { DuplicateWeekDto } from '../dto/planning-week.dto';
export interface EmployeeWeeklyStats {
    totalNetHours: number;
    totalBreakMinutes: number;
    shiftCount: number;
    violationsCount: number;
}
export interface DaySummary {
    date: string;
    totalNetHours: number;
    scheduledHeadcount: number;
    openShiftsCount: number;
}
export declare class PlanningWeekService {
    private readonly prisma;
    private readonly complianceService;
    constructor(prisma: PrismaService, complianceService: PlanningComplianceService);
    normalizeWeekBounds(dateStr: string): {
        weekStart: Date;
        weekEnd: Date;
        weekStartStr: string;
        weekEndStr: string;
    };
    getOrCreateWeek(companyId: string, dateStr: string, departmentId?: string): Promise<{
        planningWeek: {
            id: string;
            weekStartDate: string;
            weekEndDate: string;
            status: string;
            publishedAt: Date | null;
            publishedBy: string | null;
            notes: string | null;
        };
        weekDays: string[];
        daysSummary: Record<string, DaySummary>;
        openShifts: ({
            template: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                startTime: string;
                endTime: string;
                departmentId: string | null;
                jobTitle: string | null;
                color: string | null;
                breakMinutes: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string;
            endTime: string;
            departmentId: string | null;
            status: string;
            jobTitle: string | null;
            color: string | null;
            employeeId: string | null;
            planningWeekId: string | null;
            templateId: string | null;
            date: Date;
            breakMinutes: number;
            notes: string | null;
            isUnassigned: boolean;
        })[];
        violations: ComplianceViolation[];
        employees: {
            employee: {
                id: string;
                firstName: string;
                lastName: string;
                jobTitle: string | null;
                departmentName: string;
                standardScheduleName: string | undefined;
            };
            stats: {
                totalNetHours: number;
                totalBreakMinutes: number;
                shiftCount: number;
                violationsCount: number;
            };
            violations: ComplianceViolation[];
            days: Record<string, any[]>;
        }[];
    }>;
    publishWeek(companyId: string, dateStr: string, userId: string, departmentId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            departmentId: string | null;
            status: string;
            notes: string | null;
            weekStartDate: Date;
            weekEndDate: Date;
            publishedAt: Date | null;
            publishedBy: string | null;
        };
    }>;
    duplicateWeek(companyId: string, dto: DuplicateWeekDto, userId: string): Promise<{
        success: boolean;
        message: string;
        duplicatedCount: number;
        targetWeekId: string;
    }>;
    getMyShifts(companyId: string, userId: string, dateStr?: string): Promise<{
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            jobTitle: string | null;
        };
        weekStart: string;
        weekEnd: string;
        standardSchedule: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string | null;
            endTime: string | null;
            graceMinutes: number;
            workDays: number[];
        } | null;
        shifts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string;
            endTime: string;
            departmentId: string | null;
            status: string;
            jobTitle: string | null;
            color: string | null;
            employeeId: string | null;
            planningWeekId: string | null;
            templateId: string | null;
            date: Date;
            breakMinutes: number;
            notes: string | null;
            isUnassigned: boolean;
        }[];
        leaves: ({
            leaveType: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                daysAllowed: number;
                maxDaysPerYear: number | null;
                requiresAttachment: boolean;
                paid: boolean;
                color: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            employeeId: string;
            leaveTypeId: string;
            startDate: Date;
            endDate: Date;
            reason: string | null;
            attachmentPath: string | null;
            rejectionReason: string | null;
            approvedBy: string | null;
            approvedAt: Date | null;
            halfDay: boolean;
            halfDayPeriod: string | null;
            daysCount: number | null;
        })[];
        missions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            departmentId: string | null;
            status: string;
            location: string | null;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
        }[];
    }>;
}
