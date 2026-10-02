import { ShiftTemplateService } from '../services/shift-template.service';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '../dto/shift-template.dto';
export declare class ShiftTemplateController {
    private readonly templateService;
    constructor(templateService: ShiftTemplateService);
    create(companyId: string, dto: CreateShiftTemplateDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    findAll(companyId: string, departmentId?: string): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    update(companyId: string, id: string, dto: UpdateShiftTemplateDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
