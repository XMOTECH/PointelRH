import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
export declare class LeaveService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllRequests(companyId: string): Promise<{
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
    }[]>;
    updateStatus(companyId: string, id: string, dto: UpdateLeaveStatusDto, approverId: string): Promise<{
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
    }>;
    findMyLeaves(employeeId: string): Promise<{
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
    }[]>;
    findMyBalance(employeeId: string, year?: number): Promise<{
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
        allocated: number;
        used: number;
        pending: number;
        remaining: number;
    }[]>;
    createMyLeave(employeeId: string, companyId: string, dto: CreateLeaveRequestDto, file?: any): Promise<{
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
    }>;
    cancelMyLeave(employeeId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getLeaveTypes(companyId: string): Promise<{
        id: string;
        name: string;
        max_days_per_year: number | null;
        requires_attachment: boolean;
        paid: boolean;
        color: string;
        is_active: boolean;
    }[]>;
    private calculateDays;
    private deductBalance;
    private mapToLeaveRequestResource;
}
