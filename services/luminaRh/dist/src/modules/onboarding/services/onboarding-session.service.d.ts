import { PrismaService } from '../../../prisma/prisma.service';
import { OnboardingAuditService } from './onboarding-audit.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { SubmitCandidateDataDto } from '../dto/submit-candidate-data.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class OnboardingSessionService {
    private readonly prisma;
    private readonly auditService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: OnboardingAuditService, eventEmitter: EventEmitter2);
    createSession(companyId: string, dto: CreateSessionDto, creatorId?: string): Promise<any>;
    findByToken(magicToken: string, clientIp?: string): Promise<any>;
    submitCandidateData(magicToken: string, dto: SubmitCandidateDataDto, clientIp?: string): Promise<any>;
    updateTaskStatus(companyId: string, sessionId: string, taskId: string, userId: string, dto: UpdateTaskDto): Promise<any>;
    approveReviewAndProvision(companyId: string, sessionId: string, reviewerId: string): Promise<any>;
    cancelSession(companyId: string, sessionId: string, reason: string, userId: string): Promise<any>;
    findAll(companyId: string, status?: string): Promise<any>;
    findOne(companyId: string, sessionId: string): Promise<any>;
    private recalculateProgress;
}
