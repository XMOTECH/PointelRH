import { CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { OffboardingSessionService } from '../services/offboarding-session.service';
import { CreateOffboardingSessionDto } from '../dto/create-offboarding-session.dto';
import { UpdateOffboardingTaskDto } from '../dto/update-offboarding-task.dto';
import { SaveExitInterviewDto } from '../dto/save-exit-interview.dto';
export declare class OffboardingSessionController {
    private readonly sessionService;
    constructor(sessionService: OffboardingSessionService);
    getStats(companyId: string): Promise<{
        success: boolean;
        data: {
            activeCount: number;
            completedThisMonth: number;
            overdueTasksCount: number;
            totalPendingTasks: number;
        };
    }>;
    findAll(companyId: string, status?: string, departureReason?: string, departmentId?: string, search?: string): Promise<{
        success: boolean;
        data: {
            totalTasks: number;
            completedTasks: number;
            employee: {
                department: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: string;
                };
            } & {
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
            };
            tasks: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                title: string;
                description: string | null;
                dueDate: Date | null;
                completedAt: Date | null;
                notes: string | null;
                category: string;
                isRequired: boolean;
                sessionId: string;
                assignedRole: string;
                completedBy: string | null;
                assignedUserId: string | null;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            completedAt: Date | null;
            templateId: string | null;
            departureReason: string;
            noticePeriodType: string;
            notificationDate: Date;
            lastWorkingDate: Date;
            contractEndDate: Date;
            handoverNotes: string | null;
            exitInterviewNotes: string | null;
            reasonsFeedback: string | null;
            progressPercent: number;
            completedBy: string | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        }[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            financialSummary: {
                leaveBalances: {
                    leaveType: string;
                    remainingDays: number;
                }[];
                unpaidAdvances: {
                    id: string;
                    amount: number;
                    type: string;
                    reason: string | null;
                    createdAt: Date;
                }[];
                totalUnpaidAdvanceAmount: number;
            };
            openWorkItems: {
                tasksCount: number;
                tasks: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    departmentId: string | null;
                    status: string;
                    employeeId: string | null;
                    title: string;
                    description: string | null;
                    missionId: string | null;
                    priority: string;
                    dueDate: Date | null;
                    recurrence: string | null;
                    estimatedMinutes: number | null;
                    actualMinutes: number;
                    completedAt: Date | null;
                    createdBy: string | null;
                }[];
            };
            employee: {
                department: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: string;
                };
                schedule: {
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
            } & {
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
            };
            tasks: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                title: string;
                description: string | null;
                dueDate: Date | null;
                completedAt: Date | null;
                notes: string | null;
                category: string;
                isRequired: boolean;
                sessionId: string;
                assignedRole: string;
                completedBy: string | null;
                assignedUserId: string | null;
            }[];
            template: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                departmentId: string | null;
                description: string | null;
                departureType: string | null;
            } | null;
            auditLogs: {
                id: string;
                createdAt: Date;
                action: string;
                actorId: string | null;
                actorName: string | null;
                fromState: string | null;
                toState: string | null;
                details: import("@prisma/client/runtime/library").JsonValue | null;
                sessionId: string;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            completedAt: Date | null;
            templateId: string | null;
            departureReason: string;
            noticePeriodType: string;
            notificationDate: Date;
            lastWorkingDate: Date;
            contractEndDate: Date;
            handoverNotes: string | null;
            exitInterviewNotes: string | null;
            reasonsFeedback: string | null;
            progressPercent: number;
            completedBy: string | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        };
    }>;
    create(user: CurrentUserDto, dto: CreateOffboardingSessionDto): Promise<{
        success: boolean;
        message: string;
        data: {
            employee: {
                department: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: string;
                };
            } & {
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
            };
            tasks: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                title: string;
                description: string | null;
                dueDate: Date | null;
                completedAt: Date | null;
                notes: string | null;
                category: string;
                isRequired: boolean;
                sessionId: string;
                assignedRole: string;
                completedBy: string | null;
                assignedUserId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            completedAt: Date | null;
            templateId: string | null;
            departureReason: string;
            noticePeriodType: string;
            notificationDate: Date;
            lastWorkingDate: Date;
            contractEndDate: Date;
            handoverNotes: string | null;
            exitInterviewNotes: string | null;
            reasonsFeedback: string | null;
            progressPercent: number;
            completedBy: string | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        };
    }>;
    updateTask(user: CurrentUserDto, taskId: string, dto: UpdateOffboardingTaskDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            title: string;
            description: string | null;
            dueDate: Date | null;
            completedAt: Date | null;
            notes: string | null;
            category: string;
            isRequired: boolean;
            sessionId: string;
            assignedRole: string;
            completedBy: string | null;
            assignedUserId: string | null;
        };
    }>;
    saveExitInterview(user: CurrentUserDto, sessionId: string, dto: SaveExitInterviewDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            completedAt: Date | null;
            templateId: string | null;
            departureReason: string;
            noticePeriodType: string;
            notificationDate: Date;
            lastWorkingDate: Date;
            contractEndDate: Date;
            handoverNotes: string | null;
            exitInterviewNotes: string | null;
            reasonsFeedback: string | null;
            progressPercent: number;
            completedBy: string | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        };
    }>;
    saveHandover(user: CurrentUserDto, sessionId: string, notes: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            completedAt: Date | null;
            templateId: string | null;
            departureReason: string;
            noticePeriodType: string;
            notificationDate: Date;
            lastWorkingDate: Date;
            contractEndDate: Date;
            handoverNotes: string | null;
            exitInterviewNotes: string | null;
            reasonsFeedback: string | null;
            progressPercent: number;
            completedBy: string | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        };
    }>;
    transition(user: CurrentUserDto, sessionId: string, body: {
        event: any;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            completedAt: Date | null;
            templateId: string | null;
            departureReason: string;
            noticePeriodType: string;
            notificationDate: Date;
            lastWorkingDate: Date;
            contractEndDate: Date;
            handoverNotes: string | null;
            exitInterviewNotes: string | null;
            reasonsFeedback: string | null;
            progressPercent: number;
            completedBy: string | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        };
    }>;
}
