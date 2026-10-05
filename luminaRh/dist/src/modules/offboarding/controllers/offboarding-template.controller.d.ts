import { OffboardingTemplateService } from '../services/offboarding-template.service';
import { CreateOffboardingTemplateDto } from '../dto/create-offboarding-template.dto';
export declare class OffboardingTemplateController {
    private readonly templateService;
    constructor(templateService: OffboardingTemplateService);
    findAll(companyId: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    create(companyId: string, dto: CreateOffboardingTemplateDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
}
