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
exports.PerformanceCampaignService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const performance_enums_1 = require("../entities/performance.enums");
let PerformanceCampaignService = class PerformanceCampaignService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        const template = await this.prisma.performanceTemplate.findFirst({
            where: { id: dto.templateId, companyId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Le modèle d'évaluation avec l'ID ${dto.templateId} n'existe pas.`);
        }
        const campaign = await this.prisma.performanceCampaign.create({
            data: {
                companyId,
                templateId: dto.templateId,
                title: dto.title,
                description: dto.description,
                year: dto.year,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                status: performance_enums_1.CampaignStatus.ACTIVE,
            },
        });
        const employeeWhere = {
            companyId,
            status: 'active',
        };
        if (dto.employeeIds && dto.employeeIds.length > 0) {
            employeeWhere.id = { in: dto.employeeIds };
        }
        else if (dto.departmentIds && dto.departmentIds.length > 0) {
            employeeWhere.departmentId = { in: dto.departmentIds };
        }
        const employees = await this.prisma.employee.findMany({
            where: employeeWhere,
            select: { id: true, userId: true, departmentId: true },
        });
        if (employees.length === 0) {
            return campaign;
        }
        const managers = await this.prisma.user.findMany({
            where: {
                companyId,
                role: { in: ['manager', 'admin', 'super_admin'] },
            },
            include: { employee: true },
        });
        const defaultManagerEmployeeId = managers.find((m) => m.employee)?.employee?.id || employees[0].id;
        const evaluationData = employees.map((emp) => {
            const deptManager = managers.find((m) => m.departmentId === emp.departmentId && m.employee?.id && m.employee.id !== emp.id);
            const evaluatorId = deptManager?.employee?.id || defaultManagerEmployeeId;
            return {
                companyId,
                campaignId: campaign.id,
                employeeId: emp.id,
                evaluatorId: evaluatorId === emp.id ? (defaultManagerEmployeeId !== emp.id ? defaultManagerEmployeeId : emp.id) : evaluatorId,
                status: performance_enums_1.EvaluationStatus.NOT_STARTED,
            };
        });
        await this.prisma.performanceEvaluation.createMany({
            data: evaluationData,
            skipDuplicates: true,
        });
        return this.findOne(companyId, campaign.id);
    }
    async findAll(companyId) {
        const campaigns = await this.prisma.performanceCampaign.findMany({
            where: { companyId },
            include: {
                template: {
                    select: { id: true, title: true, category: true },
                },
                _count: {
                    select: { evaluations: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return campaigns;
    }
    async findOne(companyId, id) {
        const campaign = await this.prisma.performanceCampaign.findFirst({
            where: { id, companyId },
            include: {
                template: true,
                evaluations: {
                    include: {
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
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campagne d'évaluation avec l'ID ${id} introuvable.`);
        }
        const total = campaign.evaluations.length;
        const completed = campaign.evaluations.filter((e) => e.status === performance_enums_1.EvaluationStatus.COMPLETED).length;
        const inProgress = campaign.evaluations.filter((e) => e.status === performance_enums_1.EvaluationStatus.SELF_EVALUATION ||
            e.status === performance_enums_1.EvaluationStatus.MANAGER_REVIEW ||
            e.status === performance_enums_1.EvaluationStatus.CALIBRATION).length;
        const notStarted = campaign.evaluations.filter((e) => e.status === performance_enums_1.EvaluationStatus.NOT_STARTED).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
            ...campaign,
            stats: {
                total,
                completed,
                inProgress,
                notStarted,
                completionRate,
            },
        };
    }
    async closeCampaign(companyId, id) {
        await this.findOne(companyId, id);
        return this.prisma.performanceCampaign.update({
            where: { id },
            data: { status: performance_enums_1.CampaignStatus.CLOSED },
        });
    }
    async getGlobalStats(companyId) {
        const totalCampaigns = await this.prisma.performanceCampaign.count({
            where: { companyId },
        });
        const evaluations = await this.prisma.performanceEvaluation.findMany({
            where: { companyId },
            select: { status: true, finalRating: true },
        });
        const totalEvaluations = evaluations.length;
        const completedEvaluations = evaluations.filter((e) => e.status === performance_enums_1.EvaluationStatus.COMPLETED).length;
        const activeEvaluations = evaluations.filter((e) => e.status === performance_enums_1.EvaluationStatus.SELF_EVALUATION ||
            e.status === performance_enums_1.EvaluationStatus.MANAGER_REVIEW ||
            e.status === performance_enums_1.EvaluationStatus.CALIBRATION).length;
        const ratingsWithScore = evaluations
            .filter((e) => e.finalRating !== null && e.finalRating !== undefined)
            .map((e) => e.finalRating);
        const averageRating = ratingsWithScore.length > 0
            ? Number((ratingsWithScore.reduce((a, b) => a + b, 0) / ratingsWithScore.length).toFixed(2))
            : null;
        const completionRate = totalEvaluations > 0 ? Math.round((completedEvaluations / totalEvaluations) * 100) : 0;
        return {
            totalCampaigns,
            totalEvaluations,
            completedEvaluations,
            activeEvaluations,
            averageRating,
            completionRate,
        };
    }
};
exports.PerformanceCampaignService = PerformanceCampaignService;
exports.PerformanceCampaignService = PerformanceCampaignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceCampaignService);
//# sourceMappingURL=performance-campaign.service.js.map