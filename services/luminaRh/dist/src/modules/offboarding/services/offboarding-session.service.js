"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OffboardingSessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingSessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const offboarding_audit_service_1 = require("./offboarding-audit.service");
const offboarding_template_service_1 = require("./offboarding-template.service");
const offboarding_enums_1 = require("../entities/offboarding.enums");
const offboarding_state_machine_1 = require("../state-machine/offboarding-state-machine");
let OffboardingSessionService = OffboardingSessionService_1 = class OffboardingSessionService {
    prisma;
    auditService;
    templateService;
    logger = new common_1.Logger(OffboardingSessionService_1.name);
    constructor(prisma, auditService, templateService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.templateService = templateService;
    }
    async createSession(companyId, dto, actorId, actorName) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: dto.employeeId, companyId },
            include: { department: true, user: true },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        const existingSession = await this.prisma.offboardingSession.findFirst({
            where: {
                employeeId: dto.employeeId,
                companyId,
                status: { in: [offboarding_enums_1.OffboardingStatus.INITIATED, offboarding_enums_1.OffboardingStatus.IN_PROGRESS, offboarding_enums_1.OffboardingStatus.PENDING_DOCUMENTS] },
            },
        });
        if (existingSession) {
            throw new common_1.ConflictException('Une procédure d\'offboarding est déjà en cours pour ce collaborateur.');
        }
        let template = null;
        if (dto.templateId) {
            template = await this.templateService.findOne(companyId, dto.templateId);
        }
        else {
            const allTemplates = await this.templateService.findAll(companyId);
            template = allTemplates[0];
        }
        const lastWorkDate = new Date(dto.lastWorkingDate);
        const contractEndDate = new Date(dto.contractEndDate);
        const notifDate = dto.notificationDate ? new Date(dto.notificationDate) : new Date();
        const templateTasks = template?.templateTasks || [];
        const tasksToCreate = templateTasks.map((t) => {
            const taskDueDate = new Date(lastWorkDate);
            taskDueDate.setDate(taskDueDate.getDate() + (t.daysOffset || 0));
            return {
                title: t.title,
                description: t.description,
                category: t.category,
                assignedRole: t.assignedRole,
                isRequired: t.isRequired,
                status: offboarding_enums_1.OffboardingTaskStatus.PENDING,
                dueDate: taskDueDate,
            };
        });
        const session = await this.prisma.offboardingSession.create({
            data: {
                companyId,
                employeeId: dto.employeeId,
                templateId: template?.id || null,
                status: offboarding_enums_1.OffboardingStatus.INITIATED,
                departureReason: dto.departureReason,
                noticePeriodType: dto.noticePeriodType || 'WORKED',
                notificationDate: notifDate,
                lastWorkingDate: lastWorkDate,
                contractEndDate: contractEndDate,
                handoverNotes: dto.handoverNotes || null,
                progressPercent: 0,
                tasks: {
                    create: tasksToCreate,
                },
            },
            include: {
                employee: {
                    include: { department: true },
                },
                tasks: true,
            },
        });
        await this.auditService.log({
            sessionId: session.id,
            action: offboarding_enums_1.OffboardingAuditAction.SESSION_CREATED,
            actorId,
            actorName,
            toState: offboarding_enums_1.OffboardingStatus.INITIATED,
            details: {
                employeeId: employee.id,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                departureReason: dto.departureReason,
                tasksCount: tasksToCreate.length,
            },
        });
        return session;
    }
    async findAll(companyId, filters) {
        const where = { companyId };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.departureReason) {
            where.departureReason = filters.departureReason;
        }
        if (filters.departmentId) {
            where.employee = { departmentId: filters.departmentId };
        }
        if (filters.search) {
            where.employee = {
                ...where.employee,
                OR: [
                    { firstName: { contains: filters.search, mode: 'insensitive' } },
                    { lastName: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                ],
            };
        }
        const sessions = await this.prisma.offboardingSession.findMany({
            where,
            include: {
                employee: {
                    include: { department: true },
                },
                tasks: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return sessions.map((s) => {
            const totalTasks = s.tasks.length;
            const completedTasks = s.tasks.filter((t) => t.status === offboarding_enums_1.OffboardingTaskStatus.COMPLETED || t.status === offboarding_enums_1.OffboardingTaskStatus.WAIVED).length;
            return {
                ...s,
                totalTasks,
                completedTasks,
            };
        });
    }
    async findOne(companyId, sessionId) {
        const session = await this.prisma.offboardingSession.findFirst({
            where: { id: sessionId, companyId },
            include: {
                employee: {
                    include: {
                        department: true,
                        schedule: true,
                    },
                },
                template: true,
                tasks: {
                    orderBy: { createdAt: 'asc' },
                },
                auditLogs: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session d\'offboarding introuvable');
        }
        const leaveBalances = await this.prisma.leaveBalance.findMany({
            where: { employeeId: session.employeeId },
            include: { leaveType: true },
        });
        const unpaidAdvances = await this.prisma.advanceRequest.findMany({
            where: { employeeId: session.employeeId, repaid: false },
        });
        const openTasks = await this.prisma.task.findMany({
            where: {
                employeeId: session.employeeId,
                status: { in: ['todo', 'in_progress'] },
            },
        });
        return {
            ...session,
            financialSummary: {
                leaveBalances: leaveBalances.map((lb) => ({
                    leaveType: lb.leaveType.name,
                    remainingDays: Number(lb.remaining),
                })),
                unpaidAdvances: unpaidAdvances.map((adv) => ({
                    id: adv.id,
                    amount: Number(adv.amount),
                    type: adv.type,
                    reason: adv.reason,
                    createdAt: adv.createdAt,
                })),
                totalUnpaidAdvanceAmount: unpaidAdvances.reduce((sum, adv) => sum + Number(adv.amount), 0),
            },
            openWorkItems: {
                tasksCount: openTasks.length,
                tasks: openTasks,
            },
        };
    }
    async updateTask(companyId, taskId, dto, actorId, actorName) {
        const task = await this.prisma.offboardingTask.findFirst({
            where: { id: taskId, session: { companyId } },
            include: { session: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche d\'offboarding introuvable');
        }
        const isDone = dto.status === offboarding_enums_1.OffboardingTaskStatus.COMPLETED || dto.status === offboarding_enums_1.OffboardingTaskStatus.WAIVED;
        const completedAt = isDone ? new Date() : null;
        const completedBy = isDone ? (actorId || null) : null;
        const updatedTask = await this.prisma.offboardingTask.update({
            where: { id: taskId },
            data: {
                status: dto.status,
                notes: dto.notes !== undefined ? dto.notes : task.notes,
                completedAt,
                completedBy,
            },
        });
        const allTasks = await this.prisma.offboardingTask.findMany({
            where: { sessionId: task.sessionId },
        });
        const total = allTasks.length;
        const done = allTasks.filter((t) => t.status === offboarding_enums_1.OffboardingTaskStatus.COMPLETED || t.status === offboarding_enums_1.OffboardingTaskStatus.WAIVED).length;
        const progressPercent = total > 0 ? Math.round((done / total) * 100) : 100;
        await this.prisma.offboardingSession.update({
            where: { id: task.sessionId },
            data: { progressPercent },
        });
        await this.auditService.log({
            sessionId: task.sessionId,
            action: isDone ? offboarding_enums_1.OffboardingAuditAction.TASK_COMPLETED : offboarding_enums_1.OffboardingAuditAction.TASK_UPDATED,
            actorId,
            actorName,
            details: {
                taskId: task.id,
                taskTitle: task.title,
                status: dto.status,
                progressPercent,
            },
        });
        return updatedTask;
    }
    async saveExitInterview(companyId, sessionId, dto, actorId, actorName) {
        const session = await this.prisma.offboardingSession.findFirst({
            where: { id: sessionId, companyId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session d\'offboarding introuvable');
        }
        const updated = await this.prisma.offboardingSession.update({
            where: { id: sessionId },
            data: {
                exitInterviewNotes: dto.exitInterviewNotes,
                reasonsFeedback: dto.reasonsFeedback || null,
            },
        });
        await this.auditService.log({
            sessionId,
            action: offboarding_enums_1.OffboardingAuditAction.EXIT_INTERVIEW_SAVED,
            actorId,
            actorName,
            details: {
                hasFeedback: !!dto.reasonsFeedback,
            },
        });
        return updated;
    }
    async saveHandoverNotes(companyId, sessionId, notes, actorId, actorName) {
        const session = await this.prisma.offboardingSession.findFirst({
            where: { id: sessionId, companyId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session d\'offboarding introuvable');
        }
        const updated = await this.prisma.offboardingSession.update({
            where: { id: sessionId },
            data: { handoverNotes: notes },
        });
        await this.auditService.log({
            sessionId,
            action: offboarding_enums_1.OffboardingAuditAction.HANDOVER_NOTES_SAVED,
            actorId,
            actorName,
        });
        return updated;
    }
    async transitionStatus(companyId, sessionId, event, actorId, actorName) {
        const session = await this.prisma.offboardingSession.findFirst({
            where: { id: sessionId, companyId },
            include: {
                tasks: true,
                employee: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session d\'offboarding introuvable');
        }
        const mandatoryTasks = session.tasks.filter((t) => t.isRequired);
        const mandatoryTasksCompleted = mandatoryTasks.every((t) => t.status === offboarding_enums_1.OffboardingTaskStatus.COMPLETED || t.status === offboarding_enums_1.OffboardingTaskStatus.WAIVED);
        const context = {
            sessionId: session.id,
            currentStatus: session.status,
            mandatoryTasksCompleted,
            lastWorkingDate: session.lastWorkingDate,
            contractEndDate: session.contractEndDate,
        };
        const nextStatus = offboarding_state_machine_1.OffboardingStateMachine.transition(context, event);
        const isCompleted = nextStatus === offboarding_enums_1.OffboardingStatus.COMPLETED;
        const isCancelled = nextStatus === offboarding_enums_1.OffboardingStatus.CANCELLED;
        const updated = await this.prisma.offboardingSession.update({
            where: { id: sessionId },
            data: {
                status: nextStatus,
                completedAt: isCompleted ? new Date() : session.completedAt,
                completedBy: isCompleted ? (actorId || null) : session.completedBy,
                cancelledAt: isCancelled ? new Date() : session.cancelledAt,
                cancelReason: isCancelled && 'reason' in event ? event.reason : session.cancelReason,
            },
        });
        if (isCompleted) {
            await this.prisma.employee.update({
                where: { id: session.employeeId },
                data: { status: 'inactive' },
            });
            if (session.employee?.userId) {
                await this.prisma.user.update({
                    where: { id: session.employee.userId },
                    data: { isActive: false },
                });
            }
            this.logger.log(`[Offboarding] Employé ${session.employee.firstName} ${session.employee.lastName} (${session.employeeId}) désactivé suite à clôture offboarding.`);
        }
        await this.auditService.log({
            sessionId,
            action: isCompleted
                ? offboarding_enums_1.OffboardingAuditAction.SESSION_COMPLETED
                : isCancelled
                    ? offboarding_enums_1.OffboardingAuditAction.SESSION_CANCELLED
                    : offboarding_enums_1.OffboardingAuditAction.STATUS_CHANGED,
            actorId,
            actorName,
            fromState: session.status,
            toState: nextStatus,
            details: {
                event: event.type,
            },
        });
        return updated;
    }
    async getStats(companyId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [activeCount, completedThisMonth, allActiveTasks] = await Promise.all([
            this.prisma.offboardingSession.count({
                where: {
                    companyId,
                    status: { in: [offboarding_enums_1.OffboardingStatus.INITIATED, offboarding_enums_1.OffboardingStatus.IN_PROGRESS, offboarding_enums_1.OffboardingStatus.PENDING_DOCUMENTS] },
                },
            }),
            this.prisma.offboardingSession.count({
                where: {
                    companyId,
                    status: offboarding_enums_1.OffboardingStatus.COMPLETED,
                    completedAt: { gte: startOfMonth },
                },
            }),
            this.prisma.offboardingTask.findMany({
                where: {
                    session: {
                        companyId,
                        status: { in: [offboarding_enums_1.OffboardingStatus.INITIATED, offboarding_enums_1.OffboardingStatus.IN_PROGRESS, offboarding_enums_1.OffboardingStatus.PENDING_DOCUMENTS] },
                    },
                    status: { in: [offboarding_enums_1.OffboardingTaskStatus.PENDING, offboarding_enums_1.OffboardingTaskStatus.IN_PROGRESS] },
                },
            }),
        ]);
        const overdueTasksCount = allActiveTasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now.getTime()).length;
        return {
            activeCount,
            completedThisMonth,
            overdueTasksCount,
            totalPendingTasks: allActiveTasks.length,
        };
    }
};
exports.OffboardingSessionService = OffboardingSessionService;
exports.OffboardingSessionService = OffboardingSessionService = OffboardingSessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        offboarding_audit_service_1.OffboardingAuditService,
        offboarding_template_service_1.OffboardingTemplateService])
], OffboardingSessionService);
//# sourceMappingURL=offboarding-session.service.js.map