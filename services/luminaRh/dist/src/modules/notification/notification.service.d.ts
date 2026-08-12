import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class NotificationService {
    private readonly prisma;
    private readonly config;
    private transporter;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    handleEmployeeCreated(payload: {
        employee: any;
        password?: string;
    }): Promise<void>;
    handlePinGenerated(payload: {
        employee: any;
        pinCode: string;
    }): Promise<void>;
    handleLateArrival(payload: {
        employeeName: string;
        managerEmail: string;
        lateMinutes: number;
        clockInTime: Date;
    }): Promise<void>;
    findAllForUser(userId: string): Promise<{
        id: string;
        title: string;
        message: string;
        type: string;
        is_read: boolean;
        created_at: Date;
    }[]>;
    markAsRead(userId: string, id: string): Promise<{
        id: string;
        title: string;
        message: string;
        type: string;
        is_read: boolean;
        created_at: Date;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    private ensureOwned;
    private mapToResource;
}
