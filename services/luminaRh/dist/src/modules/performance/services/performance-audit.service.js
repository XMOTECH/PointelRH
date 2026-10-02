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
var PerformanceAuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PerformanceAuditService = PerformanceAuditService_1 = class PerformanceAuditService {
    prisma;
    logger = new common_1.Logger(PerformanceAuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
        try {
            return await this.prisma.performanceAuditLog.create({
                data: {
                    evaluationId: params.evaluationId,
                    action: params.action,
                    actorId: params.actorId || null,
                    actorIp: params.actorIp || null,
                    details: params.details || null,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erreur d'audit performance sur l'évaluation ${params.evaluationId}:`, error);
        }
    }
    async getLogsForEvaluation(evaluationId) {
        return this.prisma.performanceAuditLog.findMany({
            where: { evaluationId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PerformanceAuditService = PerformanceAuditService;
exports.PerformanceAuditService = PerformanceAuditService = PerformanceAuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceAuditService);
//# sourceMappingURL=performance-audit.service.js.map