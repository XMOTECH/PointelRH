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
exports.OnboardingDocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const onboarding_audit_service_1 = require("./onboarding-audit.service");
const onboarding_enums_1 = require("../entities/onboarding.enums");
const event_emitter_1 = require("@nestjs/event-emitter");
const onboarding_events_1 = require("../events/onboarding.events");
let OnboardingDocumentService = class OnboardingDocumentService {
    prisma;
    auditService;
    eventEmitter;
    constructor(prisma, auditService, eventEmitter) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.eventEmitter = eventEmitter;
    }
    async registerDocument(params) {
        const session = await this.prisma.onboardingSession.findUnique({
            where: { id: params.sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session d\'onboarding introuvable');
        }
        const existing = await this.prisma.employeeDocument.findFirst({
            where: { sessionId: params.sessionId, documentType: params.documentType },
        });
        let doc;
        if (existing) {
            doc = await this.prisma.employeeDocument.update({
                where: { id: existing.id },
                data: {
                    fileName: params.fileName,
                    fileSize: params.fileSize,
                    mimeType: params.mimeType,
                    storageKey: params.storageKey,
                    status: onboarding_enums_1.DocumentStatus.PENDING,
                    rejectionReason: null,
                    metadata: params.metadata || undefined,
                },
            });
        }
        else {
            doc = await this.prisma.employeeDocument.create({
                data: {
                    companyId: params.companyId,
                    sessionId: params.sessionId,
                    documentType: params.documentType,
                    fileName: params.fileName,
                    fileSize: params.fileSize,
                    mimeType: params.mimeType,
                    storageKey: params.storageKey,
                    status: onboarding_enums_1.DocumentStatus.PENDING,
                    metadata: params.metadata || undefined,
                },
            });
        }
        await this.auditService.log({
            sessionId: params.sessionId,
            action: onboarding_enums_1.AuditAction.DOCUMENT_UPLOADED,
            actorId: params.uploadedBy || 'CANDIDATE',
            details: { documentType: params.documentType, fileName: params.fileName },
        });
        return doc;
    }
    async reviewDocument(companyId, documentId, reviewerId, dto) {
        const doc = await this.prisma.employeeDocument.findFirst({
            where: { id: documentId, companyId },
        });
        if (!doc) {
            throw new common_1.NotFoundException('Document introuvable');
        }
        if (dto.status === onboarding_enums_1.DocumentStatus.REJECTED && !dto.rejectionReason) {
            throw new common_1.BadRequestException('Un motif de rejet est obligatoire lorsque le document est refusé');
        }
        const updated = await this.prisma.employeeDocument.update({
            where: { id: documentId },
            data: {
                status: dto.status,
                rejectionReason: dto.status === onboarding_enums_1.DocumentStatus.REJECTED ? dto.rejectionReason : null,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
            },
        });
        if (doc.sessionId) {
            await this.auditService.log({
                sessionId: doc.sessionId,
                action: onboarding_enums_1.AuditAction.DOCUMENT_REVIEWED,
                actorId: reviewerId,
                details: {
                    documentType: doc.documentType,
                    status: dto.status,
                    rejectionReason: dto.rejectionReason,
                },
            });
            this.eventEmitter.emit('onboarding.document.reviewed', new onboarding_events_1.DocumentReviewedEvent(doc.id, doc.sessionId, doc.documentType, dto.status, reviewerId));
        }
        return updated;
    }
    async findBySession(sessionId) {
        return this.prisma.employeeDocument.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.OnboardingDocumentService = OnboardingDocumentService;
exports.OnboardingDocumentService = OnboardingDocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        onboarding_audit_service_1.OnboardingAuditService,
        event_emitter_1.EventEmitter2])
], OnboardingDocumentService);
//# sourceMappingURL=onboarding-document.service.js.map