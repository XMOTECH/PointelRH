export declare class CreateSessionDto {
    templateId: string;
    candidateFirstName: string;
    candidateLastName: string;
    candidateEmail: string;
    candidatePhone: string;
    departmentId: string;
    scheduleId?: string;
    contractType: string;
    targetStartDate: string;
    probationDurationMonths?: number;
    baseSalary?: number;
    transportAllowance?: number;
    managerId?: string;
}
