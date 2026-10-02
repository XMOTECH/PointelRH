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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceEvaluationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const performance_audit_service_1 = require("./performance-audit.service");
const performance_enums_1 = require("../entities/performance.enums");
const performance_state_machine_1 = require("../state-machine/performance-state-machine");
let PerformanceEvaluationService = class PerformanceEvaluationService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(companyId, user, filters) {
        const where = { companyId };
        if (filters?.campaignId) {
            where.campaignId = filters.campaignId;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        const isAdmin = ['admin', 'super_admin'].includes(user.role);
        const isManager = user.role === 'manager';
        if (!isAdmin) {
            if (isManager && user.employeeId) {
                where.OR = [
                    { evaluatorId: user.employeeId },
                    { employeeId: user.employeeId },
                ];
            }
            else if (user.employeeId) {
                where.employeeId = user.employeeId;
            }
            else {
                return [];
            }
        }
        else if (filters?.employeeId) {
            where.employeeId = filters.employeeId;
        }
        return this.prisma.performanceEvaluation.findMany({
            where,
            include: {
                campaign: {
                    select: { id: true, title: true, year: true, status: true, endDate: true },
                },
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        jobTitle: true,
                        department: { select: { id: true, name: true } },
                    },
                },
                evaluator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        jobTitle: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(companyId, id, user) {
        const evaluation = await this.prisma.performanceEvaluation.findFirst({
            where: { id, companyId },
            include: {
                campaign: {
                    include: { template: true },
                },
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        jobTitle: true,
                        department: { select: { id: true, name: true } },
                    },
                },
                evaluator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        jobTitle: true,
                    },
                },
                auditLogs: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!evaluation) {
            throw new common_1.NotFoundException(`Session d'évaluation ${id} introuvable.`);
        }
        const isAdmin = ['admin', 'super_admin'].includes(user.role);
        const isOwner = user.employeeId === evaluation.employeeId;
        const isEvaluator = user.employeeId === evaluation.evaluatorId;
        if (!isAdmin && !isOwner && !isEvaluator) {
            throw new common_1.ForbiddenException('Accès refusé : vous n\'avez pas les permissions pour consulter cette évaluation.');
        }
        const result = { ...evaluation };
        return result;
    }
    async startSelfEvaluation(companyId, id, user) {
        const evaluation = await this.getEvaluationForUpdate(companyId, id);
        if (user.employeeId !== evaluation.employeeId && !['admin', 'super_admin'].includes(user.role)) {
            throw new common_1.ForbiddenException('Seul le collaborateur concerné peut démarrer son auto-évaluation.');
        }
        const nextStatus = performance_state_machine_1.PerformanceStateMachine.transition({
            evaluationId: id,
            currentStatus: evaluation.status,
            hasSelfReviewData: false,
            hasManagerReviewData: false,
            isEmployeeSigned: false,
            isManagerSigned: false,
            campaignIsActive: evaluation.campaign.status === performance_enums_1.CampaignStatus.ACTIVE,
        }, { type: 'START_SELF_EVALUATION' });
        const updated = await this.prisma.performanceEvaluation.update({
            where: { id },
            data: { status: nextStatus },
        });
        await this.auditService.log({
            evaluationId: id,
            action: 'START_SELF_EVALUATION',
            actorId: user.id,
            details: { fromStatus: evaluation.status, toStatus: nextStatus },
        });
        return updated;
    }
    async saveDraftSelfReview(companyId, id, user, dto) {
        const evaluation = await this.getEvaluationForUpdate(companyId, id);
        if (user.employeeId !== evaluation.employeeId && !['admin', 'super_admin'].includes(user.role)) {
            throw new common_1.ForbiddenException('Seul le collaborateur concerné peut modifier son auto-évaluation.');
        }
        if (evaluation.status !== performance_enums_1.EvaluationStatus.NOT_STARTED &&
            evaluation.status !== performance_enums_1.EvaluationStatus.SELF_EVALUATION) {
            throw new common_1.BadRequestException('L\'auto-évaluation ne peut plus être modifiée dans son statut actuel.');
        }
        return this.prisma.performanceEvaluation.update({
            where: { id },
            data: {
                selfReviewData: dto.answers,
                selfRating: dto.selfRating,
                status: performance_enums_1.EvaluationStatus.SELF_EVALUATION,
            },
        });
    }
    async submitSelfReview(companyId, id, user, dto) {
        const evaluation = await this.getEvaluationForUpdate(companyId, id);
        if (user.employeeId !== evaluation.employeeId && !['admin', 'super_admin'].includes(user.role)) {
            throw new common_1.ForbiddenException('Seul le collaborateur concerné peut soumettre son auto-évaluation.');
        }
        const nextStatus = performance_state_machine_1.PerformanceStateMachine.transition({
            evaluationId: id,
            currentStatus: evaluation.status,
            hasSelfReviewData: Object.keys(dto.answers || {}).length > 0,
            hasManagerReviewData: false,
            isEmployeeSigned: false,
            isManagerSigned: false,
            campaignIsActive: evaluation.campaign.status === performance_enums_1.CampaignStatus.ACTIVE,
        }, { type: 'SUBMIT_SELF_EVALUATION' });
        const updated = await this.prisma.performanceEvaluation.update({
            where: { id },
            data: {
                selfReviewData: dto.answers,
                selfRating: dto.selfRating,
                status: nextStatus,
            },
        });
        await this.auditService.log({
            evaluationId: id,
            action: 'SUBMIT_SELF_EVALUATION',
            actorId: user.id,
            details: { selfRating: dto.selfRating },
        });
        return updated;
    }
    async submitManagerReview(companyId, id, user, dto) {
        const evaluation = await this.getEvaluationForUpdate(companyId, id);
        if (user.employeeId !== evaluation.evaluatorId && !['admin', 'super_admin'].includes(user.role)) {
            throw new common_1.ForbiddenException('Seul l\'évaluateur assigné ou un administrateur RH peut soumettre cette revue.');
        }
        const nextStatus = performance_state_machine_1.PerformanceStateMachine.transition({
            evaluationId: id,
            currentStatus: evaluation.status,
            hasSelfReviewData: !!evaluation.selfReviewData,
            hasManagerReviewData: Object.keys(dto.answers || {}).length > 0,
            isEmployeeSigned: false,
            isManagerSigned: false,
            campaignIsActive: evaluation.campaign.status === performance_enums_1.CampaignStatus.ACTIVE,
        }, { type: 'SUBMIT_MANAGER_REVIEW' });
        let finalRating = dto.managerRating;
        if (evaluation.selfRating) {
            finalRating = Number((dto.managerRating * 0.7 + evaluation.selfRating * 0.3).toFixed(2));
        }
        const updated = await this.prisma.performanceEvaluation.update({
            where: { id },
            data: {
                managerReviewData: dto.answers,
                managerRating: dto.managerRating,
                finalRating,
                sharedNotes: dto.sharedNotes,
                status: nextStatus,
            },
        });
        await this.auditService.log({
            evaluationId: id,
            action: 'SUBMIT_MANAGER_REVIEW',
            actorId: user.id,
            details: { managerRating: dto.managerRating, finalRating },
        });
        return updated;
    }
    async signEvaluation(companyId, id, user, dto) {
        const evaluation = await this.getEvaluationForUpdate(companyId, id);
        if (evaluation.status !== performance_enums_1.EvaluationStatus.CALIBRATION) {
            throw new common_1.BadRequestException('L\'évaluation ne peut être signée qu\'en phase de calibration / signature.');
        }
        let isEmployeeSigned = !!evaluation.employeeSignedAt;
        let isManagerSigned = !!evaluation.managerSignedAt;
        const now = new Date();
        const dataToUpdate = {};
        if (dto.signerRole === 'EMPLOYEE') {
            if (user.employeeId !== evaluation.employeeId) {
                throw new common_1.ForbiddenException('Seul le collaborateur peut signer pour le rôle EMPLOYEE.');
            }
            dataToUpdate.employeeSignedAt = now;
            isEmployeeSigned = true;
        }
        else if (dto.signerRole === 'MANAGER') {
            if (user.employeeId !== evaluation.evaluatorId && !['admin', 'super_admin'].includes(user.role)) {
                throw new common_1.ForbiddenException('Seul le manager ou un administrateur peut signer pour le rôle MANAGER.');
            }
            dataToUpdate.managerSignedAt = now;
            isManagerSigned = true;
        }
        if (isEmployeeSigned && isManagerSigned) {
            dataToUpdate.status = performance_enums_1.EvaluationStatus.COMPLETED;
            dataToUpdate.completedAt = now;
        }
        const updated = await this.prisma.performanceEvaluation.update({
            where: { id },
            data: dataToUpdate,
        });
        await this.auditService.log({
            evaluationId: id,
            action: `SIGN_${dto.signerRole}`,
            actorId: user.id,
            details: {
                isFullyCompleted: isEmployeeSigned && isManagerSigned,
                finalComment: dto.finalComment,
            },
        });
        return updated;
    }
    async getEvaluationForUpdate(companyId, id) {
        const evaluation = await this.prisma.performanceEvaluation.findFirst({
            where: { id, companyId },
            include: {
                campaign: true,
            },
        });
        if (!evaluation) {
            throw new common_1.NotFoundException(`Session d'évaluation ${id} introuvable.`);
        }
        return evaluation;
    }
};
exports.PerformanceEvaluationService = PerformanceEvaluationService;
exports.PerformanceEvaluationService = PerformanceEvaluationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        performance_audit_service_1.PerformanceAuditService])
], PerformanceEvaluationService);
//# sourceMappingURL=performance-evaluation.service.js.map