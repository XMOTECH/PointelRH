import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OnboardingAuditService } from './onboarding-audit.service';
import { ReviewDocumentDto } from '../dto/review-document.dto';
import { DocumentStatus, AuditAction } from '../entities/onboarding.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentReviewedEvent } from '../events/onboarding.events';

@Injectable()
export class OnboardingDocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: OnboardingAuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Register a newly uploaded document metadata in the session vault.
   */
  async registerDocument(params: {
    companyId: string;
    sessionId: string;
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storageKey: string;
    metadata?: any;
    uploadedBy?: string;
  }) {
    const session = await (this.prisma as any).onboardingSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session d\'onboarding introuvable');
    }

    // Check if an existing document of this type exists for this session -> replace or update
    const existing = await (this.prisma as any).employeeDocument.findFirst({
      where: { sessionId: params.sessionId, documentType: params.documentType },
    });

    let doc;
    if (existing) {
      doc = await (this.prisma as any).employeeDocument.update({
        where: { id: existing.id },
        data: {
          fileName: params.fileName,
          fileSize: params.fileSize,
          mimeType: params.mimeType,
          storageKey: params.storageKey,
          status: DocumentStatus.PENDING,
          rejectionReason: null,
          metadata: params.metadata || undefined,
        },
      });
    } else {
      doc = await (this.prisma as any).employeeDocument.create({
        data: {
          companyId: params.companyId,
          sessionId: params.sessionId,
          documentType: params.documentType,
          fileName: params.fileName,
          fileSize: params.fileSize,
          mimeType: params.mimeType,
          storageKey: params.storageKey,
          status: DocumentStatus.PENDING,
          metadata: params.metadata || undefined,
        },
      });
    }

    await this.auditService.log({
      sessionId: params.sessionId,
      action: AuditAction.DOCUMENT_UPLOADED,
      actorId: params.uploadedBy || 'CANDIDATE',
      details: { documentType: params.documentType, fileName: params.fileName },
    });

    return doc;
  }

  /**
   * Review a document by an HR or HSE officer (Validate or Reject with reason)
   */
  async reviewDocument(
    companyId: string,
    documentId: string,
    reviewerId: string,
    dto: ReviewDocumentDto,
  ) {
    const doc = await (this.prisma as any).employeeDocument.findFirst({
      where: { id: documentId, companyId },
    });

    if (!doc) {
      throw new NotFoundException('Document introuvable');
    }

    if (dto.status === DocumentStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Un motif de rejet est obligatoire lorsque le document est refusé');
    }

    const updated = await (this.prisma as any).employeeDocument.update({
      where: { id: documentId },
      data: {
        status: dto.status,
        rejectionReason: dto.status === DocumentStatus.REJECTED ? dto.rejectionReason : null,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    if (doc.sessionId) {
      await this.auditService.log({
        sessionId: doc.sessionId,
        action: AuditAction.DOCUMENT_REVIEWED,
        actorId: reviewerId,
        details: {
          documentType: doc.documentType,
          status: dto.status,
          rejectionReason: dto.rejectionReason,
        },
      });

      this.eventEmitter.emit(
        'onboarding.document.reviewed',
        new DocumentReviewedEvent(doc.id, doc.sessionId, doc.documentType, dto.status, reviewerId),
      );
    }

    return updated;
  }

  /**
   * List all documents for a specific session
   */
  async findBySession(sessionId: string) {
    return (this.prisma as any).employeeDocument.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
