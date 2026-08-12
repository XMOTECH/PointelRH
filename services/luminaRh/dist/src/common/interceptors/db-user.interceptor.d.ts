import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export declare class DbUserInterceptor implements NestInterceptor {
    private readonly prisma;
    constructor(prisma: PrismaService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<import("rxjs").Observable<any>>;
}
