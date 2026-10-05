import { TaskStatus } from '../entities/onboarding.enums';
export declare class UpdateTaskDto {
    status: TaskStatus;
    rejectionReason?: string;
}
