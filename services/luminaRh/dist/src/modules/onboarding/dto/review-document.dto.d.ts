import { DocumentStatus } from '../entities/onboarding.enums';
export declare class ReviewDocumentDto {
    status: DocumentStatus;
    rejectionReason?: string;
}
