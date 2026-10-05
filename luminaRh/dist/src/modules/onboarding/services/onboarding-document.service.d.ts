import { PrismaService } from '../../../prisma/prisma.service';
import { OnboardingAuditService } from './onboarding-audit.service';
import { ReviewDocumentDto } from '../dto/review-document.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class OnboardingDocumentService {
    private readonly prisma;
    private readonly auditService;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, auditService: OnboardingAuditService, eventEmitter: EventEmitter2);
    registerDocument(params: {
        companyId: string;
        sessionId: string;
        documentType: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        storageKey: string;
        metadata?: any;
        uploadedBy?: string;
    }): Promise<any>;
    reviewDocument(companyId: string, documentId: string, reviewerId: string, dto: ReviewDocumentDto): Promise<any>;
    findBySession(sessionId: string): Promise<any>;
}
