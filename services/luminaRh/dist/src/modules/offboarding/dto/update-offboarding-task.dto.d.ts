import { OffboardingTaskStatus } from '../entities/offboarding.enums';
export declare class UpdateOffboardingTaskDto {
    status: OffboardingTaskStatus;
    notes?: string;
}
