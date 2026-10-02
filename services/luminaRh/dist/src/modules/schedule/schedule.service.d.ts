import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class ScheduleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, dto: CreateScheduleDto): Promise<{
        id: string;
        name: string;
        start_time: string;
        end_time: string;
        work_days: number[];
        grace_minutes: number;
        created_at: Date;
        updated_at: Date;
    }>;
    findAll(companyId: string): Promise<{
        id: string;
        name: string;
        start_time: string;
        end_time: string;
        work_days: number[];
        grace_minutes: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findOne(companyId: string, id: string): Promise<{
        id: string;
        name: string;
        start_time: string;
        end_time: string;
        work_days: number[];
        grace_minutes: number;
        created_at: Date;
        updated_at: Date;
    }>;
    update(companyId: string, id: string, dto: UpdateScheduleDto): Promise<{
        id: string;
        name: string;
        start_time: string;
        end_time: string;
        work_days: number[];
        grace_minutes: number;
        created_at: Date;
        updated_at: Date;
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
    }>;
    private mapToResource;
}
