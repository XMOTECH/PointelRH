"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingProvisioningTriggeredEvent = exports.OnboardingStatusChangedEvent = exports.DocumentReviewedEvent = exports.CandidateDataSubmittedEvent = exports.OnboardingSessionCreatedEvent = void 0;
class OnboardingSessionCreatedEvent {
    sessionId;
    companyId;
    candidateEmail;
    candidatePhone;
    magicToken;
    targetStartDate;
    constructor(sessionId, companyId, candidateEmail, candidatePhone, magicToken, targetStartDate) {
        this.sessionId = sessionId;
        this.companyId = companyId;
        this.candidateEmail = candidateEmail;
        this.candidatePhone = candidatePhone;
        this.magicToken = magicToken;
        this.targetStartDate = targetStartDate;
    }
}
exports.OnboardingSessionCreatedEvent = OnboardingSessionCreatedEvent;
class CandidateDataSubmittedEvent {
    sessionId;
    companyId;
    candidateName;
    constructor(sessionId, companyId, candidateName) {
        this.sessionId = sessionId;
        this.companyId = companyId;
        this.candidateName = candidateName;
    }
}
exports.CandidateDataSubmittedEvent = CandidateDataSubmittedEvent;
class DocumentReviewedEvent {
    documentId;
    sessionId;
    documentType;
    status;
    reviewerId;
    constructor(documentId, sessionId, documentType, status, reviewerId) {
        this.documentId = documentId;
        this.sessionId = sessionId;
        this.documentType = documentType;
        this.status = status;
        this.reviewerId = reviewerId;
    }
}
exports.DocumentReviewedEvent = DocumentReviewedEvent;
class OnboardingStatusChangedEvent {
    sessionId;
    companyId;
    fromStatus;
    toStatus;
    actorId;
    constructor(sessionId, companyId, fromStatus, toStatus, actorId) {
        this.sessionId = sessionId;
        this.companyId = companyId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorId = actorId;
    }
}
exports.OnboardingStatusChangedEvent = OnboardingStatusChangedEvent;
class OnboardingProvisioningTriggeredEvent {
    sessionId;
    companyId;
    constructor(sessionId, companyId) {
        this.sessionId = sessionId;
        this.companyId = companyId;
    }
}
exports.OnboardingProvisioningTriggeredEvent = OnboardingProvisioningTriggeredEvent;
//# sourceMappingURL=onboarding.events.js.map