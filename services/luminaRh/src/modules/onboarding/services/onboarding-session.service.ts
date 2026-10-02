import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OnboardingAuditService } from './onboarding-audit.service';
import { OnboardingStateMachine, StateMachineContext } from '../state-machine/onboarding-state-machine';
import { OnboardingStatus, TaskStatus, DocumentStatus, AuditAction } from '../entities/onboarding.enums';
import { CreateSessionDto } from '../dto/create-session.dto';
import { SubmitCandidateDataDto } from '../dto/submit-candidate-data.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OnboardingSessionCreatedEvent,
  CandidateDataSubmittedEvent,
  OnboardingStatusChangedEvent,
  OnboardingProvisioningTriggeredEvent,
} from '../events/onboarding.events';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OnboardingSessionService {
  private readonly logger = new Logger(OnboardingSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: OnboardingAuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 1. Initialize a new Onboarding Session from a Template
   */
  async createSession(companyId: string, dto: CreateSessionDto, creatorId?: string) {
    const template = await (this.prisma as any).onboardingTemplate.findFirst({
      where: { id: dto.templateId, companyId },
      include: {
        templateTasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Modèle d\'onboarding spécifié introuvable');
    }

    const startDate = new Date(dto.targetStartDate);
    const probationMonths = dto.probationDurationMonths ?? 3;
    const probationEndDate = new Date(startDate);
    probationEndDate.setMonth(probationEndDate.getMonth() + probationMonths);

    // Generate secure cryptographic magic token for candidate self-service portal
    const magicToken = randomBytes(24).toString('hex');
    const magicTokenExpiresAt = new Date();
    magicTokenExpiresAt.setDate(magicTokenExpiresAt.getDate() + 30); // Valid 30 days

    // Initial staging data payload
    const stagingData = {
      candidateFirstName: dto.candidateFirstName,
      candidateLastName: dto.candidateLastName,
      candidateEmail: dto.candidateEmail,
      candidatePhone: dto.candidatePhone,
      departmentId: dto.departmentId,
      scheduleId: dto.scheduleId || null,
      contractType: dto.contractType,
      targetStartDate: dto.targetStartDate,
      baseSalary: dto.baseSalary || 0,
      transportAllowance: dto.transportAllowance || 20800,
      managerId: dto.managerId || null,
    };

    // Create session in Prisma
    const session = await (this.prisma as any).onboardingSession.create({
      data: {
        companyId,
        templateId: dto.templateId,
        status: OnboardingStatus.INVITED,
        magicToken,
        magicTokenExpiresAt,
        targetStartDate: startDate,
        probationEndDate,
        stagingData,
        progressPercent: 0,
      },
    });

    // Clone template tasks into concrete session tasks and preserve DAG dependencies
    const templateTaskIdToSessionTaskId = new Map<string, string>();

    // Step A: Create all tasks first
    for (const tTask of template.templateTasks) {
      const taskDueDate = new Date(startDate);
      taskDueDate.setDate(taskDueDate.getDate() + tTask.daysOffset);

      const createdTask = await (this.prisma as any).onboardingTask.create({
        data: {
          sessionId: session.id,
          title: tTask.title,
          description: tTask.description,
          category: tTask.category,
          assignedRole: tTask.targetRole,
          isRequired: tTask.isRequired,
          dueDate: taskDueDate,
          status: TaskStatus.PENDING,
        },
      });

      templateTaskIdToSessionTaskId.set(tTask.id, createdTask.id);
    }

    // Step B: Wire DAG dependencies
    for (const tTask of template.templateTasks) {
      if (tTask.prerequisiteId && templateTaskIdToSessionTaskId.has(tTask.prerequisiteId)) {
        const currentTaskId = templateTaskIdToSessionTaskId.get(tTask.id);
        const prerequisiteTaskId = templateTaskIdToSessionTaskId.get(tTask.prerequisiteId);

        if (currentTaskId && prerequisiteTaskId) {
          await (this.prisma as any).onboardingTask.update({
            where: { id: currentTaskId },
            data: { prerequisiteTaskId },
          });
        }
      }
    }

    await this.auditService.log({
      sessionId: session.id,
      action: AuditAction.SESSION_CREATED,
      actorId: creatorId || 'HR_ADMIN',
      toState: OnboardingStatus.INVITED,
      details: { templateName: template.name, candidateEmail: dto.candidateEmail },
    });

    this.eventEmitter.emit(
      'onboarding.session.created',
      new OnboardingSessionCreatedEvent(
        session.id,
        companyId,
        dto.candidateEmail,
        dto.candidatePhone,
        magicToken,
        startDate,
      ),
    );

    return this.findOne(companyId, session.id);
  }

  /**
   * 2. Find a session by its Magic Token (Candidate Self-Service Entrypoint)
   */
  async findByToken(magicToken: string, clientIp?: string) {
    const session = await (this.prisma as any).onboardingSession.findUnique({
      where: { magicToken },
      include: {
        company: {
          select: { id: true, name: true },
        },
        template: {
          select: { name: true, description: true },
        },
        tasks: {
          where: { assignedRole: 'candidate' },
          orderBy: { dueDate: 'asc' },
        },
        documents: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Lien d\'onboarding introuvable ou invalide');
    }

    if (session.magicTokenExpiresAt && new Date(session.magicTokenExpiresAt) < new Date()) {
      throw new UnauthorizedException('Ce lien d\'onboarding a expiré. Veuillez contacter les ressources humaines.');
    }

    // If candidate opens link for the first time while in INVITED state, transition to COLLECTING_DATA
    if (session.status === OnboardingStatus.INVITED) {
      const nextStatus = OnboardingStateMachine.transition(
        {
          sessionId: session.id,
          currentStatus: session.status as OnboardingStatus,
          mandatoryDocsValidated: false,
          hasRejectedDocs: false,
          requiredPreDayOneTasksCompleted: false,
          targetStartDate: session.targetStartDate,
        },
        { type: 'ACCESS_MAGIC_LINK' },
      );

      await (this.prisma as any).onboardingSession.update({
        where: { id: session.id },
        data: { status: nextStatus },
      });

      await this.auditService.log({
        sessionId: session.id,
        action: AuditAction.MAGIC_LINK_OPENED,
        actorId: 'CANDIDATE',
        actorIp: clientIp,
        fromState: session.status,
        toState: nextStatus,
      });

      session.status = nextStatus;
    }

    return session;
  }

  /**
   * 3. Candidate submits their personal, fiscal and emergency details
   */
  async submitCandidateData(magicToken: string, dto: SubmitCandidateDataDto, clientIp?: string) {
    const session = await (this.prisma as any).onboardingSession.findUnique({
      where: { magicToken },
      include: { documents: true, tasks: true },
    });

    if (!session) {
      throw new NotFoundException('Session introuvable');
    }

    // Calculate tax parts according to Senegalese CGI quotient familial
    // Célibataire: 1.0, Marié: 1.5, +0.5 per child, max 5.0
    let taxParts = dto.maritalStatus === 'married' ? 1.5 : 1.0;
    taxParts += (dto.childrenCount || 0) * 0.5;
    taxParts = Math.min(5.0, Math.max(1.0, taxParts));

    // Merge existing stagingData with submitted data
    const existingStaging = (session.stagingData as Record<string, any>) || {};
    const updatedStaging = {
      ...existingStaging,
      ...dto,
      calculatedTaxParts: taxParts,
    };

    // Transition state machine to IN_REVIEW
    const nextStatus = OnboardingStateMachine.transition(
      {
        sessionId: session.id,
        currentStatus: session.status as OnboardingStatus,
        mandatoryDocsValidated: false,
        hasRejectedDocs: false,
        requiredPreDayOneTasksCompleted: false,
        targetStartDate: session.targetStartDate,
      },
      { type: 'SUBMIT_DATA' },
    );

    // Automatically mark the candidate's first administrative task as DONE if pending
    const candidateTasks = await (this.prisma as any).onboardingTask.findMany({
      where: { sessionId: session.id, assignedRole: 'candidate', status: TaskStatus.PENDING },
    });
    if (candidateTasks.length > 0) {
      await (this.prisma as any).onboardingTask.update({
        where: { id: candidateTasks[0].id },
        data: { status: TaskStatus.DONE, completedAt: new Date(), completedBy: 'CANDIDATE' },
      });
    }

    const updatedSession = await (this.prisma as any).onboardingSession.update({
      where: { id: session.id },
      data: {
        stagingData: updatedStaging,
        status: nextStatus,
      },
    });

    await this.recalculateProgress(session.id);

    await this.auditService.log({
      sessionId: session.id,
      action: AuditAction.DATA_SUBMITTED,
      actorId: 'CANDIDATE',
      actorIp: clientIp,
      fromState: session.status,
      toState: nextStatus,
    });

    this.eventEmitter.emit(
      'onboarding.candidate.submitted',
      new CandidateDataSubmittedEvent(
        session.id,
        session.companyId,
        `${existingStaging.candidateFirstName} ${existingStaging.candidateLastName}`,
      ),
    );

    return updatedSession;
  }

  /**
   * 4. Update an individual task status (with DAG prerequisite enforcement)
   */
  async updateTaskStatus(
    companyId: string,
    sessionId: string,
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ) {
    const task = await (this.prisma as any).onboardingTask.findFirst({
      where: { id: taskId, sessionId },
      include: {
        prerequisiteTask: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Tâche d\'onboarding introuvable');
    }

    // DAG Enforcement: If completing this task, ensure prerequisite task is already DONE!
    if (dto.status === TaskStatus.DONE && task.prerequisiteTask) {
      if (task.prerequisiteTask.status !== TaskStatus.DONE) {
        throw new BadRequestException(
          `Impossible de valider cette tâche : la tâche préalable obligatoire "${task.prerequisiteTask.title}" n'est pas encore terminée.`,
        );
      }
    }

    const updatedTask = await (this.prisma as any).onboardingTask.update({
      where: { id: taskId },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason || null,
        completedAt: dto.status === TaskStatus.DONE ? new Date() : null,
        completedBy: dto.status === TaskStatus.DONE ? userId : null,
      },
    });

    await this.recalculateProgress(sessionId);

    await this.auditService.log({
      sessionId,
      action: AuditAction.TASK_UPDATED,
      actorId: userId,
      details: { taskId, title: task.title, status: dto.status },
    });

    return updatedTask;
  }

  /**
   * 5. Review Approval & Provisioning: Transition from IN_REVIEW -> PROVISIONING -> READY_FOR_DAY_ONE
   * Creates Employee, User, PIN code, and LeaveBalance records atomically.
   */
  async approveReviewAndProvision(companyId: string, sessionId: string, reviewerId: string) {
    const session = await (this.prisma as any).onboardingSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        documents: true,
        tasks: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session d\'onboarding introuvable');
    }

    // Check document status
    const mandatoryDocs = ['cni', 'rib'];
    const uploadedTypes = session.documents.map((d: any) => d.documentType);
    const hasMandatory = mandatoryDocs.every((t) => uploadedTypes.includes(t));
    const allValidated = session.documents.length > 0 && session.documents.every((d: any) => d.status === DocumentStatus.VALIDATED);
    const hasRejected = session.documents.some((d: any) => d.status === DocumentStatus.REJECTED);

    const fsmContext: StateMachineContext = {
      sessionId: session.id,
      currentStatus: session.status as OnboardingStatus,
      mandatoryDocsValidated: hasMandatory && allValidated,
      hasRejectedDocs: hasRejected,
      requiredPreDayOneTasksCompleted: true,
      targetStartDate: session.targetStartDate,
      now: new Date(),
    };

    // Transition 1: IN_REVIEW -> PROVISIONING
    const provisioningStatus = OnboardingStateMachine.transition(fsmContext, {
      type: 'APPROVE_REVIEW',
    });

    await (this.prisma as any).onboardingSession.update({
      where: { id: session.id },
      data: { status: provisioningStatus },
    });

    await this.auditService.log({
      sessionId: session.id,
      action: AuditAction.STATUS_CHANGED,
      actorId: reviewerId,
      fromState: session.status,
      toState: provisioningStatus,
    });

    // EXECUTE PROVISIONING (Create Employee & User records in a Prisma transaction)
    const staging = (session.stagingData as Record<string, any>) || {};
    const candidateEmail = staging.candidateEmail || `employee_${Date.now()}@luminarh.sn`;
    const candidateFirstName = staging.candidateFirstName || 'Collaborateur';
    const candidateLastName = staging.candidateLastName || 'Nouveau';

    let employeeId = session.employeeId;

    if (!employeeId) {
      // 1. Create or retrieve User in auth schema
      let user = await (this.prisma as any).user.findUnique({
        where: { email: candidateEmail },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash('LuminaRH@2026', 10);
        user = await (this.prisma as any).user.create({
          data: {
            companyId,
            email: candidateEmail,
            password: hashedPassword,
            name: `${candidateFirstName} ${candidateLastName}`,
            role: 'employee',
            departmentId: staging.departmentId,
            isActive: true,
          },
        });
      }

      // 2. Generate unique 4-digit PIN code for Kiosk
      const pinCode = String(Math.floor(1000 + Math.random() * 9000));

      // 3. Create core Employee record
      const employee = await (this.prisma as any).employee.create({
        data: {
          companyId,
          userId: user.id,
          departmentId: staging.departmentId,
          scheduleId: staging.scheduleId || null,
          firstName: candidateFirstName,
          lastName: candidateLastName,
          email: candidateEmail,
          pinCode,
          contractType: staging.contractType || 'cdi',
          hireDate: session.targetStartDate,
          status: 'active',
          baseSalary: staging.baseSalary || 0,
          transportAllowance: staging.transportAllowance || 20800,
          maritalStatus: staging.maritalStatus || 'single',
          taxParts: staging.calculatedTaxParts || 1.0,
        },
      });

      employeeId = employee.id;

      // 4. Attach employeeId to session & documents
      await (this.prisma as any).onboardingSession.update({
        where: { id: session.id },
        data: { employeeId: employee.id },
      });

      await (this.prisma as any).employeeDocument.updateMany({
        where: { sessionId: session.id },
        data: { employeeId: employee.id },
      });

      // 5. Initialize LeaveBalance for current year (Senegal standard)
      const currentYear = new Date().getFullYear();
      const defaultLeaveType = await (this.prisma as any).leaveType.findFirst({
        where: { companyId, isActive: true },
      });

      if (defaultLeaveType) {
        await (this.prisma as any).leaveBalance.upsert({
          where: {
            employeeId_leaveTypeId: {
              employeeId: employee.id,
              leaveTypeId: defaultLeaveType.id,
            },
          },
          update: {},
          create: {
            employeeId: employee.id,
            leaveTypeId: defaultLeaveType.id,
            balance: 0,
            allocated: 30,
            used: 0,
            pending: 0,
            remaining: 30,
            year: currentYear,
          },
        });
      }

      await this.auditService.log({
        sessionId: session.id,
        action: AuditAction.PROVISIONING_TRIGGERED,
        actorId: reviewerId,
        details: { employeeId: employee.id, userId: user.id, pinCodeGenerated: true },
      });
    }

    // Transition 2: PROVISIONING -> READY_FOR_DAY_ONE
    const finalContext: StateMachineContext = {
      ...fsmContext,
      currentStatus: OnboardingStatus.PROVISIONING,
    };
    const readyStatus = OnboardingStateMachine.transition(finalContext, {
      type: 'COMPLETE_PROVISIONING',
    });

    const updated = await (this.prisma as any).onboardingSession.update({
      where: { id: session.id },
      data: { status: readyStatus },
      include: {
        employee: true,
        documents: true,
        tasks: true,
      },
    });

    await this.recalculateProgress(session.id);

    this.eventEmitter.emit(
      'onboarding.provisioning.completed',
      new OnboardingProvisioningTriggeredEvent(session.id, companyId),
    );

    return updated;
  }

  /**
   * 6. Cancel a session
   */
  async cancelSession(companyId: string, sessionId: string, reason: string, userId: string) {
    const session = await (this.prisma as any).onboardingSession.findFirst({
      where: { id: sessionId, companyId },
    });

    if (!session) {
      throw new NotFoundException('Session introuvable');
    }

    const nextStatus = OnboardingStateMachine.transition(
      {
        sessionId: session.id,
        currentStatus: session.status as OnboardingStatus,
        mandatoryDocsValidated: false,
        hasRejectedDocs: false,
        requiredPreDayOneTasksCompleted: false,
        targetStartDate: session.targetStartDate,
      },
      { type: 'CANCEL', reason },
    );

    const cancelled = await (this.prisma as any).onboardingSession.update({
      where: { id: session.id },
      data: {
        status: nextStatus,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });

    await this.auditService.log({
      sessionId: session.id,
      action: AuditAction.SESSION_CANCELLED,
      actorId: userId,
      fromState: session.status,
      toState: nextStatus,
      details: { reason },
    });

    return cancelled;
  }

  /**
   * List sessions for HR dashboard with filters
   */
  async findAll(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    return (this.prisma as any).onboardingSession.findMany({
      where,
      include: {
        template: { select: { name: true } },
        employee: { select: { firstName: true, lastName: true, email: true, department: true } },
        tasks: { select: { id: true, status: true, isRequired: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single session with full details
   */
  async findOne(companyId: string, sessionId: string) {
    const session = await (this.prisma as any).onboardingSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        template: true,
        employee: {
          include: { department: true },
        },
        tasks: {
          include: { prerequisiteTask: true },
          orderBy: { dueDate: 'asc' },
        },
        documents: {
          orderBy: { createdAt: 'asc' },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session d\'onboarding introuvable');
    }

    return session;
  }

  /**
   * Helper: recalculate session completion percentage (0 - 100%)
   */
  private async recalculateProgress(sessionId: string): Promise<number> {
    const tasks = await (this.prisma as any).onboardingTask.findMany({
      where: { sessionId, isRequired: true },
    });

    if (tasks.length === 0) return 0;

    const completed = tasks.filter((t: any) => t.status === TaskStatus.DONE || t.status === TaskStatus.SKIPPED).length;
    const progressPercent = Math.round((completed / tasks.length) * 100);

    await (this.prisma as any).onboardingSession.update({
      where: { id: sessionId },
      data: { progressPercent },
    });

    return progressPercent;
  }
}
