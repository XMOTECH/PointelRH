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
var OnboardingAuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let OnboardingAuditService = OnboardingAuditService_1 = class OnboardingAuditService {
    prisma;
    logger = new common_1.Logger(OnboardingAuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
        try {
            await this.prisma.onboardingAuditLog.create({
                data: {
                    sessionId: params.sessionId,
                    action: params.action,
                    actorId: params.actorId || 'SYSTEM',
                    actorIp: params.actorIp || null,
                    fromState: params.fromState || null,
                    toState: params.toState || null,
                    details: params.details || undefined,
                },
            });
        }
        catch (err) {
            this.logger.error(`Erreur d'enregistrement dans l'audit log onboarding: ${err?.message || err}`);
        }
    }
    async getSessionLogs(sessionId) {
        return this.prisma.onboardingAuditLog.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OnboardingAuditService = OnboardingAuditService;
exports.OnboardingAuditService = OnboardingAuditService = OnboardingAuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OnboardingAuditService);
//# sourceMappingURL=onboarding-audit.service.js.map