import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    create(companyId: string, dto: CreateScheduleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            start_time: null;
            end_time: null;
            work_days: never[];
            grace_minutes: null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    findAll(companyId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            start_time: null;
            end_time: null;
            work_days: never[];
            grace_minutes: null;
            created_at: Date;
            updated_at: Date;
        }[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            start_time: null;
            end_time: null;
            work_days: never[];
            grace_minutes: null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    update(companyId: string, id: string, dto: UpdateScheduleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            start_time: null;
            end_time: null;
            work_days: never[];
            grace_minutes: null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
