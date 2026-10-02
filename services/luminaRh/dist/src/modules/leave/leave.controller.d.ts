import { LeaveService } from './leave.service';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    findAllRequests(companyId: string): Promise<{
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
            days_count: number;
            created_at: any;
            employee: {
                id: any;
                first_name: any;
                last_name: any;
            } | undefined;
        }[];
    }>;
    updateStatus(companyId: string, userId: string, id: string, dto: UpdateLeaveStatusDto): Promise<{
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
            days_count: number;
            created_at: any;
            employee: {
                id: any;
                first_name: any;
                last_name: any;
            } | undefined;
        };
    }>;
}
