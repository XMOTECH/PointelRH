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
var OffboardingAuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let OffboardingAuditService = OffboardingAuditService_1 = class OffboardingAuditService {
    prisma;
    logger = new common_1.Logger(OffboardingAuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
        try {
            return await this.prisma.offboardingAuditLog.create({
                data: {
                    sessionId: params.sessionId,
                    action: params.action,
                    actorId: params.actorId || null,
                    actorName: params.actorName || null,
                    fromState: params.fromState || null,
                    toState: params.toState || null,
                    details: params.details || null,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erreur d'audit offboarding sur la session ${params.sessionId}:`, error);
        }
    }
    async getLogsForSession(sessionId) {
        return this.prisma.offboardingAuditLog.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OffboardingAuditService = OffboardingAuditService;
exports.OffboardingAuditService = OffboardingAuditService = OffboardingAuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffboardingAuditService);
//# sourceMappingURL=offboarding-audit.service.js.map