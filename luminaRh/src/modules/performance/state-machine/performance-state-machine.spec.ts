import { BadRequestException } from '@nestjs/common';
import { EvaluationStatus } from '../entities/performance.enums';
import {
  PerformanceStateMachine,
  PerformanceStateMachineContext,
} from './performance-state-machine';

describe('PerformanceStateMachine', () => {
  const baseContext: PerformanceStateMachineContext = {
    evaluationId: 'eval-123',
    currentStatus: EvaluationStatus.NOT_STARTED,
    hasSelfReviewData: false,
    hasManagerReviewData: false,
    isEmployeeSigned: false,
    isManagerSigned: false,
    campaignIsActive: true,
  };

  it('should start self-evaluation from NOT_STARTED', () => {
    const nextStatus = PerformanceStateMachine.transition(baseContext, {
      type: 'START_SELF_EVALUATION',
    });
    expect(nextStatus).toBe(EvaluationStatus.SELF_EVALUATION);
  });

  it('should throw error when submitting self-review without data', () => {
    const context: PerformanceStateMachineContext = {
      ...baseContext,
      currentStatus: EvaluationStatus.SELF_EVALUATION,
      hasSelfReviewData: false,
    };

    expect(() =>
      PerformanceStateMachine.transition(context, {
        type: 'SUBMIT_SELF_EVALUATION',
      }),
    ).toThrow(BadRequestException);
  });

  it('should transition to MANAGER_REVIEW when self-review is submitted with data', () => {
    const context: PerformanceStateMachineContext = {
      ...baseContext,
      currentStatus: EvaluationStatus.SELF_EVALUATION,
      hasSelfReviewData: true,
    };

    const nextStatus = PerformanceStateMachine.transition(context, {
      type: 'SUBMIT_SELF_EVALUATION',
    });
    expect(nextStatus).toBe(EvaluationStatus.MANAGER_REVIEW);
  });

  it('should transition to CALIBRATION when manager review is submitted with data', () => {
    const context: PerformanceStateMachineContext = {
      ...baseContext,
      currentStatus: EvaluationStatus.MANAGER_REVIEW,
      hasSelfReviewData: true,
      hasManagerReviewData: true,
    };

    const nextStatus = PerformanceStateMachine.transition(context, {
      type: 'SUBMIT_MANAGER_REVIEW',
    });
    expect(nextStatus).toBe(EvaluationStatus.CALIBRATION);
  });

  it('should require both signatures to COMPLETE evaluation', () => {
    const context: PerformanceStateMachineContext = {
      ...baseContext,
      currentStatus: EvaluationStatus.CALIBRATION,
      hasSelfReviewData: true,
      hasManagerReviewData: true,
      isEmployeeSigned: true,
      isManagerSigned: false, // Manager missing
    };

    expect(() =>
      PerformanceStateMachine.transition(context, {
        type: 'SIGN_AND_COMPLETE',
      }),
    ).toThrow(BadRequestException);

    // With both signatures:
    const completeStatus = PerformanceStateMachine.transition(
      { ...context, isManagerSigned: true },
      { type: 'SIGN_AND_COMPLETE' },
    );
    expect(completeStatus).toBe(EvaluationStatus.COMPLETED);
  });

  it('should disallow any transition if campaign is not active', () => {
    const context: PerformanceStateMachineContext = {
      ...baseContext,
      campaignIsActive: false,
    };

    expect(() =>
      PerformanceStateMachine.transition(context, {
        type: 'START_SELF_EVALUATION',
      }),
    ).toThrow(BadRequestException);
  });
});
