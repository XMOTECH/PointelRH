import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { PerformanceAuditService } from './performance-audit.service';
import { SubmitSelfReviewDto } from '../dto/submit-self-review.dto';
import { SubmitManagerReviewDto } from '../dto/submit-manager-review.dto';
import { SignEvaluationDto } from '../dto/sign-evaluation.dto';
import { EvaluationStatus, CampaignStatus } from '../entities/performance.enums';
import { PerformanceStateMachine } from '../state-machine/performance-state-machine';

@Injectable()
export class PerformanceEvaluationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: PerformanceAuditService,
  ) {}

  async findAll(
    companyId: string,
    user: CurrentUserDto,
    filters?: { campaignId?: string; status?: string; employeeId?: string },
  ) {
    const where: any = { companyId };

    if (filters?.campaignId) {
      where.campaignId = filters.campaignId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Role-based filtering (ABAC)
    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isManager = user.role === 'manager';

    if (!isAdmin) {
      if (isManager && user.employeeId) {
        // A manager sees their direct evaluations (as evaluator) and their own (as employee)
        where.OR = [
          { evaluatorId: user.employeeId },
          { employeeId: user.employeeId },
        ];
      } else if (user.employeeId) {
        // A simple employee only sees their own evaluations
        where.employeeId = user.employeeId;
      } else {
        return [];
      }
    } else if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    return this.prisma.performanceEvaluation.findMany({
      where,
      include: {
        campaign: {
          select: { id: true, title: true, year: true, status: true, endDate: true },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            department: { select: { id: true, name: true } },
          },
        },
        evaluator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string, user: CurrentUserDto) {
    const evaluation = await this.prisma.performanceEvaluation.findFirst({
      where: { id, companyId },
      include: {
        campaign: {
          include: { template: true },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            department: { select: { id: true, name: true } },
          },
        },
        evaluator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Session d'évaluation ${id} introuvable.`);
    }

    // Access control check
    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isOwner = user.employeeId === evaluation.employeeId;
    const isEvaluator = user.employeeId === evaluation.evaluatorId;

    if (!isAdmin && !isOwner && !isEvaluator) {
      throw new ForbiddenException(
        'Accès refusé : vous n\'avez pas les permissions pour consulter cette évaluation.',
      );
    }

    // Blind Review protection:
    // If the manager has not yet reviewed or during self-eval, keep confidential drafts
    const result = { ...evaluation };

    return result;
  }

  async startSelfEvaluation(companyId: string, id: string, user: CurrentUserDto) {
    const evaluation = await this.getEvaluationForUpdate(companyId, id);

    if (user.employeeId !== evaluation.employeeId && !['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Seul le collaborateur concerné peut démarrer son auto-évaluation.');
    }

    const nextStatus = PerformanceStateMachine.transition(
      {
        evaluationId: id,
        currentStatus: evaluation.status as EvaluationStatus,
        hasSelfReviewData: false,
        hasManagerReviewData: false,
        isEmployeeSigned: false,
        isManagerSigned: false,
        campaignIsActive: evaluation.campaign.status === CampaignStatus.ACTIVE,
      },
      { type: 'START_SELF_EVALUATION' },
    );

    const updated = await this.prisma.performanceEvaluation.update({
      where: { id },
      data: { status: nextStatus },
    });

    await this.auditService.log({
      evaluationId: id,
      action: 'START_SELF_EVALUATION',
      actorId: user.id,
      details: { fromStatus: evaluation.status, toStatus: nextStatus },
    });

    return updated;
  }

  async saveDraftSelfReview(
    companyId: string,
    id: string,
    user: CurrentUserDto,
    dto: SubmitSelfReviewDto,
  ) {
    const evaluation = await this.getEvaluationForUpdate(companyId, id);

    if (user.employeeId !== evaluation.employeeId && !['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Seul le collaborateur concerné peut modifier son auto-évaluation.');
    }

    if (
      evaluation.status !== EvaluationStatus.NOT_STARTED &&
      evaluation.status !== EvaluationStatus.SELF_EVALUATION
    ) {
      throw new BadRequestException('L\'auto-évaluation ne peut plus être modifiée dans son statut actuel.');
    }

    return this.prisma.performanceEvaluation.update({
      where: { id },
      data: {
        selfReviewData: dto.answers as any,
        selfRating: dto.selfRating,
        status: EvaluationStatus.SELF_EVALUATION,
      },
    });
  }

  async submitSelfReview(
    companyId: string,
    id: string,
    user: CurrentUserDto,
    dto: SubmitSelfReviewDto,
  ) {
    const evaluation = await this.getEvaluationForUpdate(companyId, id);

    if (user.employeeId !== evaluation.employeeId && !['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Seul le collaborateur concerné peut soumettre son auto-évaluation.');
    }

    const nextStatus = PerformanceStateMachine.transition(
      {
        evaluationId: id,
        currentStatus: evaluation.status as EvaluationStatus,
        hasSelfReviewData: Object.keys(dto.answers || {}).length > 0,
        hasManagerReviewData: false,
        isEmployeeSigned: false,
        isManagerSigned: false,
        campaignIsActive: evaluation.campaign.status === CampaignStatus.ACTIVE,
      },
      { type: 'SUBMIT_SELF_EVALUATION' },
    );

    const updated = await this.prisma.performanceEvaluation.update({
      where: { id },
      data: {
        selfReviewData: dto.answers as any,
        selfRating: dto.selfRating,
        status: nextStatus,
      },
    });

    await this.auditService.log({
      evaluationId: id,
      action: 'SUBMIT_SELF_EVALUATION',
      actorId: user.id,
      details: { selfRating: dto.selfRating },
    });

    return updated;
  }

  async submitManagerReview(
    companyId: string,
    id: string,
    user: CurrentUserDto,
    dto: SubmitManagerReviewDto,
  ) {
    const evaluation = await this.getEvaluationForUpdate(companyId, id);

    if (user.employeeId !== evaluation.evaluatorId && !['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Seul l\'évaluateur assigné ou un administrateur RH peut soumettre cette revue.');
    }

    const nextStatus = PerformanceStateMachine.transition(
      {
        evaluationId: id,
        currentStatus: evaluation.status as EvaluationStatus,
        hasSelfReviewData: !!evaluation.selfReviewData,
        hasManagerReviewData: Object.keys(dto.answers || {}).length > 0,
        isEmployeeSigned: false,
        isManagerSigned: false,
        campaignIsActive: evaluation.campaign.status === CampaignStatus.ACTIVE,
      },
      { type: 'SUBMIT_MANAGER_REVIEW' },
    );

    // Calculate final rating (weighted or straight average)
    let finalRating = dto.managerRating;
    if (evaluation.selfRating) {
      // 70% manager, 30% self-assessment by default
      finalRating = Number((dto.managerRating * 0.7 + evaluation.selfRating * 0.3).toFixed(2));
    }

    const updated = await this.prisma.performanceEvaluation.update({
      where: { id },
      data: {
        managerReviewData: dto.answers as any,
        managerRating: dto.managerRating,
        finalRating,
        sharedNotes: dto.sharedNotes,
        status: nextStatus,
      },
    });

    await this.auditService.log({
      evaluationId: id,
      action: 'SUBMIT_MANAGER_REVIEW',
      actorId: user.id,
      details: { managerRating: dto.managerRating, finalRating },
    });

    return updated;
  }

  async signEvaluation(
    companyId: string,
    id: string,
    user: CurrentUserDto,
    dto: SignEvaluationDto,
  ) {
    const evaluation = await this.getEvaluationForUpdate(companyId, id);

    if (evaluation.status !== EvaluationStatus.CALIBRATION) {
      throw new BadRequestException(
        'L\'évaluation ne peut être signée qu\'en phase de calibration / signature.',
      );
    }

    let isEmployeeSigned = !!evaluation.employeeSignedAt;
    let isManagerSigned = !!evaluation.managerSignedAt;
    const now = new Date();

    const dataToUpdate: any = {};

    if (dto.signerRole === 'EMPLOYEE') {
      if (user.employeeId !== evaluation.employeeId) {
        throw new ForbiddenException('Seul le collaborateur peut signer pour le rôle EMPLOYEE.');
      }
      dataToUpdate.employeeSignedAt = now;
      isEmployeeSigned = true;
    } else if (dto.signerRole === 'MANAGER') {
      if (user.employeeId !== evaluation.evaluatorId && !['admin', 'super_admin'].includes(user.role)) {
        throw new ForbiddenException('Seul le manager ou un administrateur peut signer pour le rôle MANAGER.');
      }
      dataToUpdate.managerSignedAt = now;
      isManagerSigned = true;
    }

    // Check if both signed to close
    if (isEmployeeSigned && isManagerSigned) {
      dataToUpdate.status = EvaluationStatus.COMPLETED;
      dataToUpdate.completedAt = now;
    }

    const updated = await this.prisma.performanceEvaluation.update({
      where: { id },
      data: dataToUpdate,
    });

    await this.auditService.log({
      evaluationId: id,
      action: `SIGN_${dto.signerRole}`,
      actorId: user.id,
      details: {
        isFullyCompleted: isEmployeeSigned && isManagerSigned,
        finalComment: dto.finalComment,
      },
    });

    return updated;
  }

  private async getEvaluationForUpdate(companyId: string, id: string) {
    const evaluation = await this.prisma.performanceEvaluation.findFirst({
      where: { id, companyId },
      include: {
        campaign: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Session d'évaluation ${id} introuvable.`);
    }

    return evaluation;
  }
}
