import { ObjectiveCategory, ObjectiveStatus } from '../entities/performance.enums';
export declare class CreateObjectiveDto {
    employeeId: string;
    title: string;
    description?: string;
    category?: ObjectiveCategory;
    weight?: number;
    targetValue?: number;
    unit?: string;
    dueDate?: string;
}
export declare class UpdateObjectiveDto {
    title?: string;
    description?: string;
    currentValue?: number;
    progress?: number;
    status?: ObjectiveStatus;
}
