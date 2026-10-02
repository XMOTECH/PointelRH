import { PrismaService } from '../../../prisma/prisma.service';
export declare class PerformanceAuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(params: {
        evaluationId: string;
        action: string;
        actorId?: string;
        actorIp?: string;
        details?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        actorId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        actorIp: string | null;
        evaluationId: string;
    } | undefined>;
    getLogsForEvaluation(evaluationId: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        actorId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        actorIp: string | null;
        evaluationId: string;
    }[]>;
}
