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
exports.PerformanceObjectiveService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const performance_enums_1 = require("../entities/performance.enums");
let PerformanceObjectiveService = class PerformanceObjectiveService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, user, dto) {
        return this.prisma.performanceObjective.create({
            data: {
                companyId,
                employeeId: dto.employeeId,
                title: dto.title,
                description: dto.description,
                category: dto.category,
                weight: dto.weight || 1,
                targetValue: dto.targetValue,
                unit: dto.unit,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                status: performance_enums_1.ObjectiveStatus.NOT_STARTED,
                progress: 0,
            },
        });
    }
    async findAll(companyId, user, employeeId) {
        const where = { companyId };
        const isAdmin = ['admin', 'super_admin'].includes(user.role);
        if (!isAdmin) {
            if (user.role === 'manager' && employeeId) {
                where.employeeId = employeeId;
            }
            else if (user.employeeId) {
                where.employeeId = user.employeeId;
            }
        }
        else if (employeeId) {
            where.employeeId = employeeId;
        }
        return this.prisma.performanceObjective.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        jobTitle: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(companyId, id, user, dto) {
        const objective = await this.prisma.performanceObjective.findFirst({
            where: { id, companyId },
        });
        if (!objective) {
            throw new common_1.NotFoundException(`Objectif ${id} introuvable.`);
        }
        const isAdmin = ['admin', 'super_admin'].includes(user.role);
        const isOwner = user.employeeId === objective.employeeId;
        if (!isAdmin && !isOwner && user.role !== 'manager') {
            throw new common_1.ForbiddenException('Non autorisé à modifier cet objectif.');
        }
        let progress = dto.progress !== undefined ? dto.progress : objective.progress;
        let status = dto.status || objective.status;
        if (progress >= 100 && status !== performance_enums_1.ObjectiveStatus.EXCEEDED) {
            status = performance_enums_1.ObjectiveStatus.ACHIEVED;
        }
        else if (progress > 0 && status === performance_enums_1.ObjectiveStatus.NOT_STARTED) {
            status = performance_enums_1.ObjectiveStatus.IN_PROGRESS;
        }
        return this.prisma.performanceObjective.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                currentValue: dto.currentValue,
                progress,
                status,
            },
        });
    }
    async delete(companyId, id) {
        const objective = await this.prisma.performanceObjective.findFirst({
            where: { id, companyId },
        });
        if (!objective) {
            throw new common_1.NotFoundException(`Objectif ${id} introuvable.`);
        }
        return this.prisma.performanceObjective.delete({
            where: { id },
        });
    }
};
exports.PerformanceObjectiveService = PerformanceObjectiveService;
exports.PerformanceObjectiveService = PerformanceObjectiveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceObjectiveService);
//# sourceMappingURL=performance-objective.service.js.map