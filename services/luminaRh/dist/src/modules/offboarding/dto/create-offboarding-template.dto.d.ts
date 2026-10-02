import { DepartureReason, OffboardingTaskCategory, OffboardingTargetRole } from '../entities/offboarding.enums';
export declare class CreateOffboardingTemplateTaskDto {
    title: string;
    description?: string;
    category: OffboardingTaskCategory;
    assignedRole: OffboardingTargetRole;
    daysOffset?: number;
    isRequired?: boolean;
    order?: number;
}
export declare class CreateOffboardingTemplateDto {
    name: string;
    description?: string;
    departureType?: DepartureReason;
    departmentId?: string;
    tasks?: CreateOffboardingTemplateTaskDto[];
}
