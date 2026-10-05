import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditAction } from '../entities/onboarding.enums';

@Injectable()
export class OnboardingAuditService {
  private readonly logger = new Logger(OnboardingAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    sessionId: string;
    action: AuditAction | string;
    actorId?: string;
    actorIp?: string;
    fromState?: string;
    toState?: string;
    details?: any;
  }): Promise<void> {
    try {
      await (this.prisma as any).onboardingAuditLog.create({
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
    } catch (err: any) {
      this.logger.error(`Erreur d'enregistrement dans l'audit log onboarding: ${err?.message || err}`);
    }
  }

  async getSessionLogs(sessionId: string) {
    return (this.prisma as any).onboardingAuditLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
