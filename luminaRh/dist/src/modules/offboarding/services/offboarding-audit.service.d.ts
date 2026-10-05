import { PrismaService } from '../../../prisma/prisma.service';
import { OffboardingAuditAction } from '../entities/offboarding.enums';
export declare class OffboardingAuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(params: {
        sessionId: string;
        action: OffboardingAuditAction | string;
        actorId?: string;
        actorName?: string;
        fromState?: string;
        toState?: string;
        details?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        actorId: string | null;
        actorName: string | null;
        fromState: string | null;
        toState: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        sessionId: string;
    } | undefined>;
    getLogsForSession(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        actorId: string | null;
        actorName: string | null;
        fromState: string | null;
        toState: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        sessionId: string;
    }[]>;
}
