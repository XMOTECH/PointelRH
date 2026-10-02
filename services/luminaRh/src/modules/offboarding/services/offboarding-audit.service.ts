import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OffboardingAuditAction } from '../entities/offboarding.enums';

@Injectable()
export class OffboardingAuditService {
  private readonly logger = new Logger(OffboardingAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    sessionId: string;
    action: OffboardingAuditAction | string;
    actorId?: string;
    actorName?: string;
    fromState?: string;
    toState?: string;
    details?: any;
  }) {
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
    } catch (error) {
      this.logger.error(`Erreur d'audit offboarding sur la session ${params.sessionId}:`, error);
    }
  }

  async getLogsForSession(sessionId: string) {
    return this.prisma.offboardingAuditLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
