import { PerformanceTemplateService } from '../services/performance-template.service';
import { CreatePerformanceTemplateDto } from '../dto/create-performance-template.dto';
export declare class PerformanceTemplateController {
    private readonly templateService;
    constructor(templateService: PerformanceTemplateService);
    create(companyId: string, dto: CreatePerformanceTemplateDto): Promise<{
        success: boolean;
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            title: string;
            description: string | null;
            category: string;
            sections: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    findAll(companyId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            title: string;
            description: string | null;
            category: string;
            sections: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            title: string;
            description: string | null;
            category: string;
            sections: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    update(companyId: string, id: string, dto: Partial<CreatePerformanceTemplateDto>): Promise<{
        success: boolean;
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            title: string;
            description: string | null;
            category: string;
            sections: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
}
