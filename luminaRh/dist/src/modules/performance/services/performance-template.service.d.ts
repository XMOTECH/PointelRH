import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePerformanceTemplateDto } from '../dto/create-performance-template.dto';
export declare class PerformanceTemplateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, dto: CreatePerformanceTemplateDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        title: string;
        description: string | null;
        category: string;
        sections: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(companyId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        title: string;
        description: string | null;
        category: string;
        sections: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(companyId: string, id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        title: string;
        description: string | null;
        category: string;
        sections: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(companyId: string, id: string, dto: Partial<CreatePerformanceTemplateDto>): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        title: string;
        description: string | null;
        category: string;
        sections: import("@prisma/client/runtime/library").JsonValue;
    }>;
    seedDefaultTemplates(companyId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        title: string;
        description: string | null;
        category: string;
        sections: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
