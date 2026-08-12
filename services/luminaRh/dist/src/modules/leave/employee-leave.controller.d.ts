import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { CurrentUserDto } from '../../common/decorators/current-user.decorator';
export declare class EmployeeLeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    findMyLeaves(user: CurrentUserDto): Promise<{
        success: boolean;
        data: {
            id: any;
            employee_id: any;
            employee_name: string | undefined;
            leave_type_id: any;
            leave_type: any;
            start_date: any;
            end_date: any;
            reason: any;
            rejection_reason: any;
            status: any;
            approved_by: any;
            approved_at: any;
            attachment_path: any;
            half_day: any;
            half_day_period: any;
            days_count: any;
            created_at: any;
            employee: {
                id: any;
                first_name: any;
                last_name: any;
            } | undefined;
        }[];
    }>;
    findMyBalance(user: CurrentUserDto, year?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            leave_type_id: string;
            leave_type: {
                id: string;
                name: string;
                max_days_per_year: number | null;
                requires_attachment: boolean;
                paid: boolean;
                color: string;
                is_active: boolean;
            };
            year: number;
            allocated: import("@prisma/client/runtime/library").Decimal;
            used: import("@prisma/client/runtime/library").Decimal;
            pending: import("@prisma/client/runtime/library").Decimal;
            remaining: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    createMyLeave(user: CurrentUserDto, dto: CreateLeaveRequestDto): Promise<{
        success: boolean;
        data: {
            id: any;
            employee_id: any;
            employee_name: string | undefined;
            leave_type_id: any;
            leave_type: any;
            start_date: any;
            end_date: any;
            reason: any;
            rejection_reason: any;
            status: any;
            approved_by: any;
            approved_at: any;
            attachment_path: any;
            half_day: any;
            half_day_period: any;
            days_count: any;
            created_at: any;
            employee: {
                id: any;
                first_name: any;
                last_name: any;
            } | undefined;
        };
    }>;
    cancelMyLeave(user: CurrentUserDto, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
