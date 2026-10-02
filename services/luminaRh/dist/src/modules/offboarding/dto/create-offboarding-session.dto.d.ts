import { DepartureReason, NoticePeriodType } from '../entities/offboarding.enums';
export declare class CreateOffboardingSessionDto {
    employeeId: string;
    departureReason: DepartureReason;
    noticePeriodType?: NoticePeriodType;
    notificationDate?: string;
    lastWorkingDate: string;
    contractEndDate: string;
    templateId?: string;
    handoverNotes?: string;
}
