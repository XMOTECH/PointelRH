import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class ScheduleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, dto: CreateScheduleDto): Promise<{
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
    }>;
    findAll(companyId: string): Promise<{
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
    }[]>;
    findOne(companyId: string, id: string): Promise<{
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
    }>;
    update(companyId: string, id: string, dto: UpdateScheduleDto): Promise<{
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
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
    }>;
    assignEmployees(companyId: string, scheduleId: string, employeeIds: string[]): Promise<{
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
    }>;
    private mapToResource;
}
