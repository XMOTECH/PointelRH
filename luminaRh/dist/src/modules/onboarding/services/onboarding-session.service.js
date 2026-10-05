"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OnboardingSessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingSessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const onboarding_audit_service_1 = require("./onboarding-audit.service");
const onboarding_state_machine_1 = require("../state-machine/onboarding-state-machine");
const onboarding_enums_1 = require("../entities/onboarding.enums");
const event_emitter_1 = require("@nestjs/event-emitter");
const onboarding_events_1 = require("../events/onboarding.events");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcrypt"));
let OnboardingSessionService = OnboardingSessionService_1 = class OnboardingSessionService {
    prisma;
    auditService;
    eventEmitter;
    logger = new common_1.Logger(OnboardingSessionService_1.name);
    constructor(prisma, auditService, eventEmitter) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.eventEmitter = eventEmitter;
    }
    async createSession(companyId, dto, creatorId) {
        const template = await this.prisma.onboardingTemplate.findFirst({
            where: { id: dto.templateId, companyId },
            include: {
                templateTasks: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Modèle d\'onboarding spécifié introuvable');
        }
        const startDate = new Date(dto.targetStartDate);
        const probationMonths = dto.probationDurationMonths ?? 3;
        const probationEndDate = new Date(startDate);
        probationEndDate.setMonth(probationEndDate.getMonth() + probationMonths);
        const magicToken = (0, crypto_1.randomBytes)(24).toString('hex');
        const magicTokenExpiresAt = new Date();
        magicTokenExpiresAt.setDate(magicTokenExpiresAt.getDate() + 30);
        const stagingData = {
            candidateFirstName: dto.candidateFirstName,
            candidateLastName: dto.candidateLastName,
            candidateEmail: dto.candidateEmail,
            candidatePhone: dto.candidatePhone,
            departmentId: dto.departmentId,
            scheduleId: dto.scheduleId || null,
            contractType: dto.contractType,
            targetStartDate: dto.targetStartDate,
            baseSalary: dto.baseSalary || 0,
            transportAllowance: dto.transportAllowance || 20800,
            managerId: dto.managerId || null,
        };
        const session = await this.prisma.onboardingSession.create({
            data: {
                companyId,
                templateId: dto.templateId,
                status: onboarding_enums_1.OnboardingStatus.INVITED,
                magicToken,
                magicTokenExpiresAt,
                targetStartDate: startDate,
                probationEndDate,
                stagingData,
                progressPercent: 0,
            },
        });
        const templateTaskIdToSessionTaskId = new Map();
        for (const tTask of template.templateTasks) {
            const taskDueDate = new Date(startDate);
            taskDueDate.setDate(taskDueDate.getDate() + tTask.daysOffset);
            const createdTask = await this.prisma.onboardingTask.create({
                data: {
                    sessionId: session.id,
                    title: tTask.title,
                    description: tTask.description,
                    category: tTask.category,
                    assignedRole: tTask.targetRole,
                    isRequired: tTask.isRequired,
                    dueDate: taskDueDate,
                    status: onboarding_enums_1.TaskStatus.PENDING,
                },
            });
            templateTaskIdToSessionTaskId.set(tTask.id, createdTask.id);
        }
        for (const tTask of template.templateTasks) {
            if (tTask.prerequisiteId && templateTaskIdToSessionTaskId.has(tTask.prerequisiteId)) {
                const currentTaskId = templateTaskIdToSessionTaskId.get(tTask.id);
                const prerequisiteTaskId = templateTaskIdToSessionTaskId.get(tTask.prerequisiteId);
                if (currentTaskId && prerequisiteTaskId) {
                    await this.prisma.onboardingTask.update({
                        where: { id: currentTaskId },
                        data: { prerequisiteTaskId },
                    });
                }
            }
        }
        await this.auditService.log({
            sessionId: session.id,
            action: onboarding_enums_1.AuditAction.SESSION_CREATED,
            actorId: creatorId || 'HR_ADMIN',
            toState: onboarding_enums_1.OnboardingStatus.INVITED,
            details: { templateName: template.name, candidateEmail: dto.candidateEmail },
        });
        this.eventEmitter.emit('onboarding.session.created', new onboarding_events_1.OnboardingSessionCreatedEvent(session.id, companyId, dto.candidateEmail, dto.candidatePhone, magicToken, startDate));
        return this.findOne(companyId, session.id);
    }
    async findByToken(magicToken, clientIp) {
        const session = await this.prisma.onboardingSession.findUnique({
            where: { magicToken },
            include: {
                company: {
                    select: { id: true, name: true },
                },
                template: {
                    select: { name: true, description: true },
                },
                tasks: {
                    where: { assignedRole: 'candidate' },
                    orderBy: { dueDate: 'asc' },
                },
                documents: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Lien d\'onboarding introuvable ou invalide');
        }
        if (session.magicTokenExpiresAt && new Date(session.magicTokenExpiresAt) < new Date()) {
            throw new common_1.UnauthorizedException('Ce lien d\'onboarding a expiré. Veuillez contacter les ressources humaines.');
        }
        if (session.status === onboarding_enums_1.OnboardingStatus.INVITED) {
            const nextStatus = onboarding_state_machine_1.OnboardingStateMachine.transition({
                sessionId: session.id,
                currentStatus: session.status,
                mandatoryDocsValidated: false,
                hasRejectedDocs: false,
                requiredPreDayOneTasksCompleted: false,
                targetStartDate: session.targetStartDate,
            }, { type: 'ACCESS_MAGIC_LINK' });
            await this.prisma.onboardingSession.update({
                where: { id: session.id },
                data: { status: nextStatus },
            });
            await this.auditService.log({
                sessionId: session.id,
                action: onboarding_enums_1.AuditAction.MAGIC_LINK_OPENED,
                actorId: 'CANDIDATE',
                actorIp: clientIp,
                fromState: session.status,
                toState: nextStatus,
            });
            session.status = nextStatus;
        }
        return session;
    }
    async submitCandidateData(magicToken, dto, clientIp) {
        const session = await this.prisma.onboardingSession.findUnique({
            where: { magicToken },
            include: { documents: true, tasks: true },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session introuvable');
        }
        let taxParts = dto.maritalStatus === 'married' ? 1.5 : 1.0;
        taxParts += (dto.childrenCount || 0) * 0.5;
        taxParts = Math.min(5.0, Math.max(1.0, taxParts));
        const existingStaging = session.stagingData || {};
        const updatedStaging = {
            ...existingStaging,
            ...dto,
            calculatedTaxParts: taxParts,
        };
        const nextStatus = onboarding_state_machine_1.OnboardingStateMachine.transition({
            sessionId: session.id,
            currentStatus: session.status,
            mandatoryDocsValidated: false,
            hasRejectedDocs: false,
            requiredPreDayOneTasksCompleted: false,
            targetStartDate: session.targetStartDate,
        }, { type: 'SUBMIT_DATA' });
        const candidateTasks = await this.prisma.onboardingTask.findMany({
            where: { sessionId: session.id, assignedRole: 'candidate', status: onboarding_enums_1.TaskStatus.PENDING },
        });
        if (candidateTasks.length > 0) {
            await this.prisma.onboardingTask.update({
                where: { id: candidateTasks[0].id },
                data: { status: onboarding_enums_1.TaskStatus.DONE, completedAt: new Date(), completedBy: 'CANDIDATE' },
            });
        }
        const updatedSession = await this.prisma.onboardingSession.update({
            where: { id: session.id },
            data: {
                stagingData: updatedStaging,
                status: nextStatus,
            },
        });
        await this.recalculateProgress(session.id);
        await this.auditService.log({
            sessionId: session.id,
            action: onboarding_enums_1.AuditAction.DATA_SUBMITTED,
            actorId: 'CANDIDATE',
            actorIp: clientIp,
            fromState: session.status,
            toState: nextStatus,
        });
        this.eventEmitter.emit('onboarding.candidate.submitted', new onboarding_events_1.CandidateDataSubmittedEvent(session.id, session.companyId, `${existingStaging.candidateFirstName} ${existingStaging.candidateLastName}`));
        return updatedSession;
    }
    async updateTaskStatus(companyId, sessionId, taskId, userId, dto) {
        const task = await this.prisma.onboardingTask.findFirst({
            where: { id: taskId, sessionId },
            include: {
                prerequisiteTask: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche d\'onboarding introuvable');
        }
        if (dto.status === onboarding_enums_1.TaskStatus.DONE && task.prerequisiteTask) {
            if (task.prerequisiteTask.status !== onboarding_enums_1.TaskStatus.DONE) {
                throw new common_1.BadRequestException(`Impossible de valider cette tâche : la tâche préalable obligatoire "${task.prerequisiteTask.title}" n'est pas encore terminée.`);
            }
        }
        const updatedTask = await this.prisma.onboardingTask.update({
            where: { id: taskId },
            data: {
                status: dto.status,
                rejectionReason: dto.rejectionReason || null,
                completedAt: dto.status === onboarding_enums_1.TaskStatus.DONE ? new Date() : null,
                completedBy: dto.status === onboarding_enums_1.TaskStatus.DONE ? userId : null,
            },
        });
        await this.recalculateProgress(sessionId);
        await this.auditService.log({
            sessionId,
            action: onboarding_enums_1.AuditAction.TASK_UPDATED,
            actorId: userId,
            details: { taskId, title: task.title, status: dto.status },
        });
        return updatedTask;
    }
    async approveReviewAndProvision(companyId, sessionId, reviewerId) {
        const session = await this.prisma.onboardingSession.findFirst({
            where: { id: sessionId, companyId },
            include: {
                documents: true,
                tasks: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session d\'onboarding introuvable');
        }
        const mandatoryDocs = ['cni', 'rib'];
        const uploadedTypes = session.documents.map((d) => d.documentType);
        const hasMandatory = mandatoryDocs.every((t) => uploadedTypes.includes(t));
        const allValidated = session.documents.length > 0 && session.documents.every((d) => d.status === onboarding_enums_1.DocumentStatus.VALIDATED);
        const hasRejected = session.documents.some((d) => d.status === onboarding_enums_1.DocumentStatus.REJECTED);
        const fsmContext = {
            sessionId: session.id,
            currentStatus: session.status,
            mandatoryDocsValidated: hasMandatory && allValidated,
            hasRejectedDocs: hasRejected,
            requiredPreDayOneTasksCompleted: true,
            targetStartDate: session.targetStartDate,
            now: new Date(),
        };
        const provisioningStatus = onboarding_state_machine_1.OnboardingStateMachine.transition(fsmContext, {
            type: 'APPROVE_REVIEW',
        });
        await this.prisma.onboardingSession.update({
            where: { id: session.id },
            data: { status: provisioningStatus },
        });
        await this.auditService.log({
            sessionId: session.id,
            action: onboarding_enums_1.AuditAction.STATUS_CHANGED,
            actorId: reviewerId,
            fromState: session.status,
            toState: provisioningStatus,
        });
        const staging = session.stagingData || {};
        const candidateEmail = staging.candidateEmail || `employee_${Date.now()}@luminarh.sn`;
        const candidateFirstName = staging.candidateFirstName || 'Collaborateur';
        const candidateLastName = staging.candidateLastName || 'Nouveau';
        let employeeId = session.employeeId;
        if (!employeeId) {
            let user = await this.prisma.user.findUnique({
                where: { email: candidateEmail },
            });
            if (!user) {
                const hashedPassword = await bcrypt.hash('LuminaRH@2026', 10);
                user = await this.prisma.user.create({
                    data: {
                        companyId,
                        email: candidateEmail,
                        password: hashedPassword,
                        name: `${candidateFirstName} ${candidateLastName}`,
                        role: 'employee',
                        departmentId: staging.departmentId,
                        isActive: true,
                    },
                });
            }
            const pinCode = String(Math.floor(1000 + Math.random() * 9000));
            const employee = await this.prisma.employee.create({
                data: {
                    companyId,
                    userId: user.id,
                    departmentId: staging.departmentId,
                    scheduleId: staging.scheduleId || null,
                    firstName: candidateFirstName,
                    lastName: candidateLastName,
                    email: candidateEmail,
                    pinCode,
                    contractType: staging.contractType || 'cdi',
                    hireDate: session.targetStartDate,
                    status: 'active',
                    baseSalary: staging.baseSalary || 0,
                    transportAllowance: staging.transportAllowance || 20800,
                    maritalStatus: staging.maritalStatus || 'single',
                    taxParts: staging.calculatedTaxParts || 1.0,
                },
            });
            employeeId = employee.id;
            await this.prisma.onboardingSession.update({
                where: { id: session.id },
                data: { employeeId: employee.id },
            });
            await this.prisma.employeeDocument.updateMany({
                where: { sessionId: session.id },
                data: { employeeId: employee.id },
            });
            const currentYear = new Date().getFullYear();
            const defaultLeaveType = await this.prisma.leaveType.findFirst({
                where: { companyId, isActive: true },
            });
            if (defaultLeaveType) {
                await this.prisma.leaveBalance.upsert({
                    where: {
                        employeeId_leaveTypeId: {
                            employeeId: employee.id,
                            leaveTypeId: defaultLeaveType.id,
                        },
                    },
                    update: {},
                    create: {
                        employeeId: employee.id,
                        leaveTypeId: defaultLeaveType.id,
                        balance: 0,
                        allocated: 30,
                        used: 0,
                        pending: 0,
                        remaining: 30,
                        year: currentYear,
                    },
                });
            }
            await this.auditService.log({
                sessionId: session.id,
                action: onboarding_enums_1.AuditAction.PROVISIONING_TRIGGERED,
                actorId: reviewerId,
                details: { employeeId: employee.id, userId: user.id, pinCodeGenerated: true },
            });
        }
        const finalContext = {
            ...fsmContext,
            currentStatus: onboarding_enums_1.OnboardingStatus.PROVISIONING,
        };
        const readyStatus = onboarding_state_machine_1.OnboardingStateMachine.transition(finalContext, {
            type: 'COMPLETE_PROVISIONING',
        });
        const updated = await this.prisma.onboardingSession.update({
            where: { id: session.id },
            data: { status: readyStatus },
            include: {
                employee: true,
                documents: true,
                tasks: true,
            },
        });
        await this.recalculateProgress(session.id);
        this.eventEmitter.emit('onboarding.provisioning.completed', new onboarding_events_1.OnboardingProvisioningTriggeredEvent(session.id, companyId));
        return updated;
    }
    async cancelSession(companyId, sessionId, reason, userId) {
        const session = await this.prisma.onboardingSession.findFirst({
            where: { id: sessionId, companyId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session introuvable');
        }
        const nextStatus = onboarding_state_machine_1.OnboardingStateMachine.transition({
            sessionId: session.id,
            currentStatus: session.status,
            mandatoryDocsValidated: false,
            hasRejectedDocs: false,
            requiredPreDayOneTasksCompleted: false,
            targetStartDate: session.targetStartDate,
        }, { type: 'CANCEL', reason });
        const cancelled = await this.prisma.onboardingSession.update({
            where: { id: session.id },
            data: {
                status: nextStatus,
                cancelledAt: new Date(),
                cancelReason: reason,
            },
        });
        await this.auditService.log({
            sessionId: session.id,
            action: onboarding_enums_1.AuditAction.SESSION_CANCELLED,
            actorId: userId,
            fromState: session.status,
            toState: nextStatus,
            details: { reason },
        });
        return cancelled;
    }
    async findAll(companyId, status) {
        const where = { companyId };
        if (status) {
            where.status = status;
        }
        return this.prisma.onboardingSession.findMany({
            where,
            include: {
                template: { select: { name: true } },
                employee: { select: { firstName: true, lastName: true, email: true, department: true } },
                tasks: { select: { id: true, status: true, isRequired: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(companyId, sessionId) {
        const session = await this.prisma.onboardingSession.findFirst({
            where: { id: sessionId, companyId },
            include: {
                template: true,
                employee: {
                    include: { department: true },
                },
                tasks: {
                    include: { prerequisiteTask: true },
                    orderBy: { dueDate: 'asc' },
                },
                documents: {
                    orderBy: { createdAt: 'asc' },
                },
                auditLogs: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session d\'onboarding introuvable');
        }
        return session;
    }
    async recalculateProgress(sessionId) {
        const tasks = await this.prisma.onboardingTask.findMany({
            where: { sessionId, isRequired: true },
        });
        if (tasks.length === 0)
            return 0;
        const completed = tasks.filter((t) => t.status === onboarding_enums_1.TaskStatus.DONE || t.status === onboarding_enums_1.TaskStatus.SKIPPED).length;
        const progressPercent = Math.round((completed / tasks.length) * 100);
        await this.prisma.onboardingSession.update({
            where: { id: sessionId },
            data: { progressPercent },
        });
        return progressPercent;
    }
};
exports.OnboardingSessionService = OnboardingSessionService;
exports.OnboardingSessionService = OnboardingSessionService = OnboardingSessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        onboarding_audit_service_1.OnboardingAuditService,
        event_emitter_1.EventEmitter2])
], OnboardingSessionService);
//# sourceMappingURL=onboarding-session.service.js.map