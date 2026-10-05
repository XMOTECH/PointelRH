import { LeaveService } from './leave.service';
export declare class LeaveTypeController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    getLeaveTypes(companyId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            max_days_per_year: number | null;
            requires_attachment: boolean;
            paid: boolean;
            color: string;
            is_active: boolean;
        }[];
    }>;
}
