export declare class CreateShiftTemplateDto {
    name: string;
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    color?: string;
    jobTitle?: string;
    departmentId?: string;
}
export declare class UpdateShiftTemplateDto {
    name?: string;
    startTime?: string;
    endTime?: string;
    breakMinutes?: number;
    color?: string;
    jobTitle?: string;
    isActive?: boolean;
}
