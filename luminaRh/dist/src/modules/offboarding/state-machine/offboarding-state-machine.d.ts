import { OffboardingStatus } from '../entities/offboarding.enums';
export interface OffboardingStateMachineContext {
    sessionId: string;
    currentStatus: OffboardingStatus;
    mandatoryTasksCompleted: boolean;
    unresolvedAdvanceRequestsCount?: number;
    lastWorkingDate: Date;
    contractEndDate: Date;
    now?: Date;
}
export type OffboardingEvent = {
    type: 'START_OFFBOARDING';
} | {
    type: 'SUBMIT_FOR_DOCUMENTS';
} | {
    type: 'REOPEN_TASKS';
} | {
    type: 'COMPLETE_OFFBOARDING';
} | {
    type: 'CANCEL';
    reason: string;
};
export declare class OffboardingStateMachine {
    private static readonly ALLOWED_TRANSITIONS;
    static canTransition(from: OffboardingStatus, to: OffboardingStatus): boolean;
    static transition(context: OffboardingStateMachineContext, event: OffboardingEvent): OffboardingStatus;
    private static assertTransition;
}
