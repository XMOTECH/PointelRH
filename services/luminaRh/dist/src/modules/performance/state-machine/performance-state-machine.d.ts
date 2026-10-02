import { EvaluationStatus } from '../entities/performance.enums';
export interface PerformanceStateMachineContext {
    evaluationId: string;
    currentStatus: EvaluationStatus;
    hasSelfReviewData: boolean;
    hasManagerReviewData: boolean;
    isEmployeeSigned: boolean;
    isManagerSigned: boolean;
    campaignIsActive: boolean;
}
export type PerformanceEvent = {
    type: 'START_SELF_EVALUATION';
} | {
    type: 'SUBMIT_SELF_EVALUATION';
} | {
    type: 'REQUEST_REVISION';
    reason: string;
} | {
    type: 'SUBMIT_MANAGER_REVIEW';
} | {
    type: 'SIGN_AND_COMPLETE';
} | {
    type: 'CANCEL';
    reason: string;
};
export declare class PerformanceStateMachine {
    private static readonly ALLOWED_TRANSITIONS;
    static canTransition(from: EvaluationStatus, to: EvaluationStatus): boolean;
    static transition(context: PerformanceStateMachineContext, event: PerformanceEvent): EvaluationStatus;
    private static assertTransition;
}
