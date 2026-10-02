import { PrismaService } from '../../../prisma/prisma.service';
import { AuditAction } from '../entities/onboarding.enums';
export declare class OnboardingAuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(params: {
        sessionId: string;
        action: AuditAction | string;
        actorId?: string;
        actorIp?: string;
        fromState?: string;
        toState?: string;
        details?: any;
    }): Promise<void>;
    getSessionLogs(sessionId: string): Promise<any>;
}
