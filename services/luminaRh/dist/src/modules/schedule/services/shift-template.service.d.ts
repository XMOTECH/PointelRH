import { PrismaService } from '../../../prisma/prisma.service';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '../dto/shift-template.dto';
export declare class ShiftTemplateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, dto: CreateShiftTemplateDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        startTime: string;
        endTime: string;
        departmentId: string | null;
        jobTitle: string | null;
        color: string | null;
        breakMinutes: number;
    }>;
    findAll(companyId: string, departmentId?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        startTime: string;
        endTime: string;
        departmentId: string | null;
        jobTitle: string | null;
        color: string | null;
        breakMinutes: number;
    }[]>;
    findOne(companyId: string, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        startTime: string;
        endTime: string;
        departmentId: string | null;
        jobTitle: string | null;
        color: string | null;
        breakMinutes: number;
    }>;
    update(companyId: string, id: string, dto: UpdateShiftTemplateDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        startTime: string;
        endTime: string;
        departmentId: string | null;
        jobTitle: string | null;
        color: string | null;
        breakMinutes: number;
    }>;
    remove(companyId: string, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        startTime: string;
        endTime: string;
        departmentId: string | null;
        jobTitle: string | null;
        color: string | null;
        breakMinutes: number;
    }>;
}
