import { TaskCategory, TargetRole } from '../entities/onboarding.enums';
export declare class CreateTemplateTaskDto {
    title: string;
    description?: string;
    category: TaskCategory;
    targetRole: TargetRole;
    daysOffset: number;
    isRequired: boolean;
    order: number;
    prerequisiteId?: string;
}
export declare class CreateTemplateDto {
    name: string;
    description?: string;
    contractType?: string;
    departmentId?: string;
    tasks: CreateTemplateTaskDto[];
}
