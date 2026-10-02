import { OnboardingStatus } from '../entities/onboarding.enums';
export interface StateMachineContext {
    sessionId: string;
    currentStatus: OnboardingStatus;
    mandatoryDocsValidated: boolean;
    hasRejectedDocs: boolean;
    requiredPreDayOneTasksCompleted: boolean;
    targetStartDate: Date;
    now?: Date;
}
export type OnboardingEvent = {
    type: 'INVITE_CANDIDATE';
} | {
    type: 'ACCESS_MAGIC_LINK';
} | {
    type: 'SUBMIT_DATA';
} | {
    type: 'APPROVE_REVIEW';
} | {
    type: 'REJECT_REVIEW';
    reason: string;
} | {
    type: 'COMPLETE_PROVISIONING';
} | {
    type: 'START_ORIENTATION';
} | {
    type: 'COMPLETE_ONBOARDING';
} | {
    type: 'CANCEL';
    reason: string;
};
export declare class OnboardingStateMachine {
    private static readonly ALLOWED_TRANSITIONS;
    static canTransition(from: OnboardingStatus, to: OnboardingStatus): boolean;
    static transition(context: StateMachineContext, event: OnboardingEvent): OnboardingStatus;
    private static assertTransition;
}
