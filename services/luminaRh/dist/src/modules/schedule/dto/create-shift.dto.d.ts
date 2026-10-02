export declare class CreateShiftDto {
    employeeId?: string;
    departmentId?: string;
    templateId?: string;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    jobTitle?: string;
    color?: string;
    notes?: string;
    isUnassigned?: boolean;
}
