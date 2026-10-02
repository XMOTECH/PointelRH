import { OnboardingStatus, DocumentStatus } from '../entities/onboarding.enums';

export class OnboardingSessionCreatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly companyId: string,
    public readonly candidateEmail: string,
    public readonly candidatePhone: string,
    public readonly magicToken: string,
    public readonly targetStartDate: Date,
  ) {}
}

export class CandidateDataSubmittedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly companyId: string,
    public readonly candidateName: string,
  ) {}
}

export class DocumentReviewedEvent {
  constructor(
    public readonly documentId: string,
    public readonly sessionId: string,
    public readonly documentType: string,
    public readonly status: DocumentStatus,
    public readonly reviewerId: string,
  ) {}
}

export class OnboardingStatusChangedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly companyId: string,
    public readonly fromStatus: OnboardingStatus,
    public readonly toStatus: OnboardingStatus,
    public readonly actorId?: string,
  ) {}
}

export class OnboardingProvisioningTriggeredEvent {
  constructor(
    public readonly sessionId: string,
    public readonly companyId: string,
  ) {}
}
