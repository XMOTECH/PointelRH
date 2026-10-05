import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AssignEmployeesDto } from './dto/assign-employees.dto';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    create(companyId: string, dto: CreateScheduleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            name: any;
            start_time: any;
            end_time: any;
            work_days: any;
            grace_minutes: any;
            assigned_employees_count: any;
            assigned_employees: any;
            created_at: any;
            updated_at: any;
        };
    }>;
    findAll(companyId: string): Promise<{
        success: boolean;
        data: {
            id: any;
            name: any;
            start_time: any;
            end_time: any;
            work_days: any;
            grace_minutes: any;
            assigned_employees_count: any;
            assigned_employees: any;
            created_at: any;
            updated_at: any;
        }[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: any;
            name: any;
            start_time: any;
            end_time: any;
            work_days: any;
            grace_minutes: any;
            assigned_employees_count: any;
            assigned_employees: any;
            created_at: any;
            updated_at: any;
        };
    }>;
    update(companyId: string, id: string, dto: UpdateScheduleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            name: any;
            start_time: any;
            end_time: any;
            work_days: any;
            grace_minutes: any;
            assigned_employees_count: any;
            assigned_employees: any;
            created_at: any;
            updated_at: any;
        };
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assignEmployees(companyId: string, id: string, dto: AssignEmployeesDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            name: any;
            start_time: any;
            end_time: any;
            work_days: any;
            grace_minutes: any;
            assigned_employees_count: any;
            assigned_employees: any;
            created_at: any;
            updated_at: any;
        };
    }>;
}
