import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OffboardingAuditService } from './offboarding-audit.service';
import { OffboardingTemplateService } from './offboarding-template.service';
import { CreateOffboardingSessionDto } from '../dto/create-offboarding-session.dto';
import { UpdateOffboardingTaskDto } from '../dto/update-offboarding-task.dto';
import { SaveExitInterviewDto } from '../dto/save-exit-interview.dto';
import { OffboardingStatus, OffboardingAuditAction, OffboardingTaskStatus } from '../entities/offboarding.enums';
import { OffboardingStateMachine, OffboardingEvent } from '../state-machine/offboarding-state-machine';

@Injectable()
export class OffboardingSessionService {
  private readonly logger = new Logger(OffboardingSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: OffboardingAuditService,
    private readonly templateService: OffboardingTemplateService,
  ) {}

  /**
   * Crée et initialise une session d'offboarding pour un collaborateur
   */
  async createSession(companyId: string, dto: CreateOffboardingSessionDto, actorId?: string, actorName?: string) {
    // 1. Vérifier l'employé
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
      include: { department: true, user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employé introuvable');
    }

    // 2. Vérifier qu'il n'y a pas déjà une session active d'offboarding
    const existingSession = await this.prisma.offboardingSession.findFirst({
      where: {
        employeeId: dto.employeeId,
        companyId,
        status: { in: [OffboardingStatus.INITIATED, OffboardingStatus.IN_PROGRESS, OffboardingStatus.PENDING_DOCUMENTS] },
      },
    });

    if (existingSession) {
      throw new ConflictException('Une procédure d\'offboarding est déjà en cours pour ce collaborateur.');
    }

    // 3. Résoudre le modèle de template à cloner
    let template = null;
    if (dto.templateId) {
      template = await this.templateService.findOne(companyId, dto.templateId);
    } else {
      const allTemplates = await this.templateService.findAll(companyId);
      template = allTemplates[0];
    }

    const lastWorkDate = new Date(dto.lastWorkingDate);
    const contractEndDate = new Date(dto.contractEndDate);
    const notifDate = dto.notificationDate ? new Date(dto.notificationDate) : new Date();

    // 4. Préparer les tâches concrètes à partir du template
    const templateTasks = template?.templateTasks || [];
    const tasksToCreate = templateTasks.map((t) => {
      const taskDueDate = new Date(lastWorkDate);
      taskDueDate.setDate(taskDueDate.getDate() + (t.daysOffset || 0));

      return {
        title: t.title,
        description: t.description,
        category: t.category,
        assignedRole: t.assignedRole,
        isRequired: t.isRequired,
        status: OffboardingTaskStatus.PENDING,
        dueDate: taskDueDate,
      };
    });

    // 5. Créer la session en base de données
    const session = await this.prisma.offboardingSession.create({
      data: {
        companyId,
        employeeId: dto.employeeId,
        templateId: template?.id || null,
        status: OffboardingStatus.INITIATED,
        departureReason: dto.departureReason,
        noticePeriodType: dto.noticePeriodType || 'WORKED',
        notificationDate: notifDate,
        lastWorkingDate: lastWorkDate,
        contractEndDate: contractEndDate,
        handoverNotes: dto.handoverNotes || null,
        progressPercent: 0,
        tasks: {
          create: tasksToCreate,
        },
      },
      include: {
        employee: {
          include: { department: true },
        },
        tasks: true,
      },
    });

    // 6. Audit
    await this.auditService.log({
      sessionId: session.id,
      action: OffboardingAuditAction.SESSION_CREATED,
      actorId,
      actorName,
      toState: OffboardingStatus.INITIATED,
      details: {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        departureReason: dto.departureReason,
        tasksCount: tasksToCreate.length,
      },
    });

    return session;
  }

  /**
   * Récupère la liste de toutes les sessions d'offboarding avec filtres
   */
  async findAll(companyId: string, filters: { status?: string; departureReason?: string; departmentId?: string; search?: string }) {
    const where: any = { companyId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.departureReason) {
      where.departureReason = filters.departureReason;
    }
    if (filters.departmentId) {
      where.employee = { departmentId: filters.departmentId };
    }
    if (filters.search) {
      where.employee = {
        ...where.employee,
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    const sessions = await this.prisma.offboardingSession.findMany({
      where,
      include: {
        employee: {
          include: { department: true },
        },
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => {
      const totalTasks = s.tasks.length;
      const completedTasks = s.tasks.filter(
        (t) => t.status === OffboardingTaskStatus.COMPLETED || t.status === OffboardingTaskStatus.WAIVED,
      ).length;

      return {
        ...s,
        totalTasks,
        completedTasks,
      };
    });
  }

  /**
   * Récupère la fiche détaillée à 360° d'une session avec intégration des modules
   */
  async findOne(companyId: string, sessionId: string) {
    const session = await this.prisma.offboardingSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        employee: {
          include: {
            department: true,
            schedule: true,
          },
        },
        template: true,
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session d\'offboarding introuvable');
    }

    // Données croisées avec les autres modules RH :
    // A. Solde de congés restants à indemniser
    const leaveBalances = await this.prisma.leaveBalance.findMany({
      where: { employeeId: session.employeeId },
      include: { leaveType: true },
    });

    // B. Acomptes ou prêts non encore remboursés
    const unpaidAdvances = await this.prisma.advanceRequest.findMany({
      where: { employeeId: session.employeeId, repaid: false },
    });

    // C. Tâches ou missions ouvertes à réassigner
    const openTasks = await this.prisma.task.findMany({
      where: {
        employeeId: session.employeeId,
        status: { in: ['todo', 'in_progress'] },
      },
    });

    return {
      ...session,
      financialSummary: {
        leaveBalances: leaveBalances.map((lb) => ({
          leaveType: lb.leaveType.name,
          remainingDays: Number(lb.remaining),
        })),
        unpaidAdvances: unpaidAdvances.map((adv) => ({
          id: adv.id,
          amount: Number(adv.amount),
          type: adv.type,
          reason: adv.reason,
          createdAt: adv.createdAt,
        })),
        totalUnpaidAdvanceAmount: unpaidAdvances.reduce((sum, adv) => sum + Number(adv.amount), 0),
      },
      openWorkItems: {
        tasksCount: openTasks.length,
        tasks: openTasks,
      },
    };
  }

  /**
   * Met à jour le statut d'une tâche d'offboarding et recalcule la progression
   */
  async updateTask(companyId: string, taskId: string, dto: UpdateOffboardingTaskDto, actorId?: string, actorName?: string) {
    const task = await this.prisma.offboardingTask.findFirst({
      where: { id: taskId, session: { companyId } },
      include: { session: true },
    });

    if (!task) {
      throw new NotFoundException('Tâche d\'offboarding introuvable');
    }

    const isDone = dto.status === OffboardingTaskStatus.COMPLETED || dto.status === OffboardingTaskStatus.WAIVED;
    const completedAt = isDone ? new Date() : null;
    const completedBy = isDone ? (actorId || null) : null;

    const updatedTask = await this.prisma.offboardingTask.update({
      where: { id: taskId },
      data: {
        status: dto.status,
        notes: dto.notes !== undefined ? dto.notes : task.notes,
        completedAt,
        completedBy,
      },
    });

    // Recalculer le pourcentage de progression de la session
    const allTasks = await this.prisma.offboardingTask.findMany({
      where: { sessionId: task.sessionId },
    });

    const total = allTasks.length;
    const done = allTasks.filter(
      (t) => t.status === OffboardingTaskStatus.COMPLETED || t.status === OffboardingTaskStatus.WAIVED,
    ).length;

    const progressPercent = total > 0 ? Math.round((done / total) * 100) : 100;

    await this.prisma.offboardingSession.update({
      where: { id: task.sessionId },
      data: { progressPercent },
    });

    await this.auditService.log({
      sessionId: task.sessionId,
      action: isDone ? OffboardingAuditAction.TASK_COMPLETED : OffboardingAuditAction.TASK_UPDATED,
      actorId,
      actorName,
      details: {
        taskId: task.id,
        taskTitle: task.title,
        status: dto.status,
        progressPercent,
      },
    });

    return updatedTask;
  }

  /**
   * Enregistre l'entretien de départ (Exit Interview)
   */
  async saveExitInterview(companyId: string, sessionId: string, dto: SaveExitInterviewDto, actorId?: string, actorName?: string) {
    const session = await this.prisma.offboardingSession.findFirst({
      where: { id: sessionId, companyId },
    });

    if (!session) {
      throw new NotFoundException('Session d\'offboarding introuvable');
    }

    const updated = await this.prisma.offboardingSession.update({
      where: { id: sessionId },
      data: {
        exitInterviewNotes: dto.exitInterviewNotes,
        reasonsFeedback: dto.reasonsFeedback || null,
      },
    });

    await this.auditService.log({
      sessionId,
      action: OffboardingAuditAction.EXIT_INTERVIEW_SAVED,
      actorId,
      actorName,
      details: {
        hasFeedback: !!dto.reasonsFeedback,
      },
    });

    return updated;
  }

  /**
   * Enregistre les notes de passation de service
   */
  async saveHandoverNotes(companyId: string, sessionId: string, notes: string, actorId?: string, actorName?: string) {
    const session = await this.prisma.offboardingSession.findFirst({
      where: { id: sessionId, companyId },
    });

    if (!session) {
      throw new NotFoundException('Session d\'offboarding introuvable');
    }

    const updated = await this.prisma.offboardingSession.update({
      where: { id: sessionId },
      data: { handoverNotes: notes },
    });

    await this.auditService.log({
      sessionId,
      action: OffboardingAuditAction.HANDOVER_NOTES_SAVED,
      actorId,
      actorName,
    });

    return updated;
  }

  /**
   * Transitionne le statut de la session selon la Machine à États formelle
   */
  async transitionStatus(companyId: string, sessionId: string, event: OffboardingEvent, actorId?: string, actorName?: string) {
    const session = await this.prisma.offboardingSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        tasks: true,
        employee: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session d\'offboarding introuvable');
    }

    // Vérifier les tâches obligatoires
    const mandatoryTasks = session.tasks.filter((t) => t.isRequired);
    const mandatoryTasksCompleted = mandatoryTasks.every(
      (t) => t.status === OffboardingTaskStatus.COMPLETED || t.status === OffboardingTaskStatus.WAIVED,
    );

    const context = {
      sessionId: session.id,
      currentStatus: session.status as OffboardingStatus,
      mandatoryTasksCompleted,
      lastWorkingDate: session.lastWorkingDate,
      contractEndDate: session.contractEndDate,
    };

    const nextStatus = OffboardingStateMachine.transition(context, event);

    const isCompleted = nextStatus === OffboardingStatus.COMPLETED;
    const isCancelled = nextStatus === OffboardingStatus.CANCELLED;

    // Mise à jour de la session
    const updated = await this.prisma.offboardingSession.update({
      where: { id: sessionId },
      data: {
        status: nextStatus,
        completedAt: isCompleted ? new Date() : session.completedAt,
        completedBy: isCompleted ? (actorId || null) : session.completedBy,
        cancelledAt: isCancelled ? new Date() : session.cancelledAt,
        cancelReason: isCancelled && 'reason' in event ? event.reason : session.cancelReason,
      },
    });

    // Si la session est complètement finalisée, désactiver l'employé et son compte
    if (isCompleted) {
      await this.prisma.employee.update({
        where: { id: session.employeeId },
        data: { status: 'inactive' },
      });

      // Désactiver le compte utilisateur s'il existe
      if (session.employee?.userId) {
        await this.prisma.user.update({
          where: { id: session.employee.userId },
          data: { isActive: false },
        });
      }

      this.logger.log(`[Offboarding] Employé ${session.employee.firstName} ${session.employee.lastName} (${session.employeeId}) désactivé suite à clôture offboarding.`);
    }

    await this.auditService.log({
      sessionId,
      action: isCompleted
        ? OffboardingAuditAction.SESSION_COMPLETED
        : isCancelled
        ? OffboardingAuditAction.SESSION_CANCELLED
        : OffboardingAuditAction.STATUS_CHANGED,
      actorId,
      actorName,
      fromState: session.status,
      toState: nextStatus,
      details: {
        event: event.type,
      },
    });

    return updated;
  }

  /**
   * Métriques et indicateurs clés (KPIs)
   */
  async getStats(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeCount, completedThisMonth, allActiveTasks] = await Promise.all([
      this.prisma.offboardingSession.count({
        where: {
          companyId,
          status: { in: [OffboardingStatus.INITIATED, OffboardingStatus.IN_PROGRESS, OffboardingStatus.PENDING_DOCUMENTS] },
        },
      }),
      this.prisma.offboardingSession.count({
        where: {
          companyId,
          status: OffboardingStatus.COMPLETED,
          completedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.offboardingTask.findMany({
        where: {
          session: {
            companyId,
            status: { in: [OffboardingStatus.INITIATED, OffboardingStatus.IN_PROGRESS, OffboardingStatus.PENDING_DOCUMENTS] },
          },
          status: { in: [OffboardingTaskStatus.PENDING, OffboardingTaskStatus.IN_PROGRESS] },
        },
      }),
    ]);

    const overdueTasksCount = allActiveTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate).getTime() < now.getTime(),
    ).length;

    return {
      activeCount,
      completedThisMonth,
      overdueTasksCount,
      totalPendingTasks: allActiveTasks.length,
    };
  }
}
