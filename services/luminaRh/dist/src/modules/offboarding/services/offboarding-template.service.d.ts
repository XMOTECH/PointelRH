import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOffboardingTemplateDto } from '../dto/create-offboarding-template.dto';
export declare class OffboardingTemplateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<({
        templateTasks: {
            id: string;
            title: string;
            description: string | null;
            templateId: string;
            category: string;
            daysOffset: number;
            isRequired: boolean;
            order: number;
            assignedRole: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        departmentId: string | null;
        description: string | null;
        departureType: string | null;
    })[]>;
    findOne(companyId: string, id: string): Promise<{
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
        } | null;
        templateTasks: {
            id: string;
            title: string;
            description: string | null;
            templateId: string;
            category: string;
            daysOffset: number;
            isRequired: boolean;
            order: number;
            assignedRole: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        departmentId: string | null;
        description: string | null;
        departureType: string | null;
    }>;
    create(companyId: string, dto: CreateOffboardingTemplateDto): Promise<{
        templateTasks: {
            id: string;
            title: string;
            description: string | null;
            templateId: string;
            category: string;
            daysOffset: number;
            isRequired: boolean;
            order: number;
            assignedRole: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        departmentId: string | null;
        description: string | null;
        departureType: string | null;
    }>;
    createDefaultTemplate(companyId: string): Promise<{
        templateTasks: {
            id: string;
            title: string;
            description: string | null;
            templateId: string;
            category: string;
            daysOffset: number;
            isRequired: boolean;
            order: number;
            assignedRole: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        departmentId: string | null;
        description: string | null;
        departureType: string | null;
    }>;
}
