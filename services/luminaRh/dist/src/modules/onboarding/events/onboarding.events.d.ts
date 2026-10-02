import { OnboardingStatus, DocumentStatus } from '../entities/onboarding.enums';
export declare class OnboardingSessionCreatedEvent {
    readonly sessionId: string;
    readonly companyId: string;
    readonly candidateEmail: string;
    readonly candidatePhone: string;
    readonly magicToken: string;
    readonly targetStartDate: Date;
    constructor(sessionId: string, companyId: string, candidateEmail: string, candidatePhone: string, magicToken: string, targetStartDate: Date);
}
export declare class CandidateDataSubmittedEvent {
    readonly sessionId: string;
    readonly companyId: string;
    readonly candidateName: string;
    constructor(sessionId: string, companyId: string, candidateName: string);
}
export declare class DocumentReviewedEvent {
    readonly documentId: string;
    readonly sessionId: string;
    readonly documentType: string;
    readonly status: DocumentStatus;
    readonly reviewerId: string;
    constructor(documentId: string, sessionId: string, documentType: string, status: DocumentStatus, reviewerId: string);
}
export declare class OnboardingStatusChangedEvent {
    readonly sessionId: string;
    readonly companyId: string;
    readonly fromStatus: OnboardingStatus;
    readonly toStatus: OnboardingStatus;
    readonly actorId?: string | undefined;
    constructor(sessionId: string, companyId: string, fromStatus: OnboardingStatus, toStatus: OnboardingStatus, actorId?: string | undefined);
}
export declare class OnboardingProvisioningTriggeredEvent {
    readonly sessionId: string;
    readonly companyId: string;
    constructor(sessionId: string, companyId: string);
}
