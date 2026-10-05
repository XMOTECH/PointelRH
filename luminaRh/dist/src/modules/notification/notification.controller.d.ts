import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    findAll(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            title: string;
            message: string;
            type: string;
            is_read: boolean;
            created_at: Date;
        }[];
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markAsRead(userId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            title: string;
            message: string;
            type: string;
            is_read: boolean;
            created_at: Date;
        };
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
