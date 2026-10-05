import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PerformanceAuditService {
  private readonly logger = new Logger(PerformanceAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    evaluationId: string;
    action: string;
    actorId?: string;
    actorIp?: string;
    details?: any;
  }) {
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
    } catch (error) {
      this.logger.error(
        `Erreur d'audit performance sur l'évaluation ${params.evaluationId}:`,
        error,
      );
    }
  }

  async getLogsForEvaluation(evaluationId: string) {
    return this.prisma.performanceAuditLog.findMany({
      where: { evaluationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
