import { PlanningWeekService } from '../services/planning-week.service';
import { WorkShiftService } from '../services/work-shift.service';
import { DuplicateWeekDto, PublishWeekDto } from '../dto/planning-week.dto';
export declare class PlanningWeekController {
    private readonly planningWeekService;
    private readonly workShiftService;
    constructor(planningWeekService: PlanningWeekService, workShiftService: WorkShiftService);
    getWeek(companyId: string, date: string, departmentId?: string): Promise<{
        success: boolean;
        data: {
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
            daysSummary: Record<string, import("../services/planning-week.service").DaySummary>;
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
            violations: import("../services/planning-compliance.service").ComplianceViolation[];
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
                violations: import("../services/planning-compliance.service").ComplianceViolation[];
                days: Record<string, any[]>;
            }[];
        };
    }>;
    getMyShifts(companyId: string, userId: string, date?: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    publishWeek(companyId: string, userId: string, dto: PublishWeekDto): Promise<{
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
    duplicateWeek(companyId: string, userId: string, dto: DuplicateWeekDto): Promise<{
        success: boolean;
        message: string;
        duplicatedCount: number;
        targetWeekId: string;
    }>;
    saveOverride(companyId: string, userId: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            date: any;
            status: string;
            reason: any;
        };
        violations?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            employee: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                email: string;
                departmentId: string;
                userId: string;
                scheduleId: string | null;
                firstName: string;
                lastName: string;
                pinCode: string | null;
                contractType: string;
                hireDate: Date;
                status: string;
                baseSalary: import("@prisma/client/runtime/library").Decimal;
                transportAllowance: import("@prisma/client/runtime/library").Decimal;
                maritalStatus: string;
                taxParts: number;
                isCadre: boolean;
                jobTitle: string | null;
            } | null;
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
        };
        violations: import("../services/planning-compliance.service").ComplianceViolation[];
    }>;
}
