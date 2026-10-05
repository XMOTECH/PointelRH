import { BadRequestException } from '@nestjs/common';
import { OnboardingStateMachine, StateMachineContext } from './onboarding-state-machine';
import { OnboardingStatus } from '../entities/onboarding.enums';

describe('OnboardingStateMachine', () => {
  const baseContext: StateMachineContext = {
    sessionId: 'session-123',
    currentStatus: OnboardingStatus.DRAFT,
    mandatoryDocsValidated: true,
    hasRejectedDocs: false,
    requiredPreDayOneTasksCompleted: true,
    targetStartDate: new Date('2026-10-01'),
    now: new Date('2026-10-01'),
  };

  it('should transition from DRAFT to INVITED', () => {
    const next = OnboardingStateMachine.transition(baseContext, { type: 'INVITE_CANDIDATE' });
    expect(next).toBe(OnboardingStatus.INVITED);
  });

  it('should transition from INVITED to COLLECTING_DATA when magic link is accessed', () => {
    const ctx = { ...baseContext, currentStatus: OnboardingStatus.INVITED };
    const next = OnboardingStateMachine.transition(ctx, { type: 'ACCESS_MAGIC_LINK' });
    expect(next).toBe(OnboardingStatus.COLLECTING_DATA);
  });

  it('should transition from COLLECTING_DATA to IN_REVIEW on data submit', () => {
    const ctx = { ...baseContext, currentStatus: OnboardingStatus.COLLECTING_DATA };
    const next = OnboardingStateMachine.transition(ctx, { type: 'SUBMIT_DATA' });
    expect(next).toBe(OnboardingStatus.IN_REVIEW);
  });

  it('should prevent PROVISIONING if mandatory docs are missing/not validated', () => {
    const ctx: StateMachineContext = {
      ...baseContext,
      currentStatus: OnboardingStatus.IN_REVIEW,
      mandatoryDocsValidated: false,
    };

    expect(() =>
      OnboardingStateMachine.transition(ctx, { type: 'APPROVE_REVIEW' }),
    ).toThrow(BadRequestException);
  });

  it('should prevent PROVISIONING if any document is rejected', () => {
    const ctx: StateMachineContext = {
      ...baseContext,
      currentStatus: OnboardingStatus.IN_REVIEW,
      mandatoryDocsValidated: true,
      hasRejectedDocs: true,
    };

    expect(() =>
      OnboardingStateMachine.transition(ctx, { type: 'APPROVE_REVIEW' }),
    ).toThrow(BadRequestException);
  });

  it('should allow transition to PROVISIONING when all docs are validated', () => {
    const ctx: StateMachineContext = {
      ...baseContext,
      currentStatus: OnboardingStatus.IN_REVIEW,
      mandatoryDocsValidated: true,
      hasRejectedDocs: false,
    };

    const next = OnboardingStateMachine.transition(ctx, { type: 'APPROVE_REVIEW' });
    expect(next).toBe(OnboardingStatus.PROVISIONING);
  });

  it('should reject invalid transitions (e.g. DRAFT to READY_FOR_DAY_ONE)', () => {
    expect(() =>
      OnboardingStateMachine.transition(baseContext, { type: 'COMPLETE_PROVISIONING' }),
    ).toThrow(BadRequestException);
  });

  it('should allow CANCEL from non-terminal states', () => {
    const ctx = { ...baseContext, currentStatus: OnboardingStatus.IN_REVIEW };
    const next = OnboardingStateMachine.transition(ctx, { type: 'CANCEL', reason: 'Candidat désisté' });
    expect(next).toBe(OnboardingStatus.CANCELLED);
  });

  it('should not allow transitions from terminal states (COMPLETED or CANCELLED)', () => {
    const completedCtx = { ...baseContext, currentStatus: OnboardingStatus.COMPLETED };
    expect(() =>
      OnboardingStateMachine.transition(completedCtx, { type: 'INVITE_CANDIDATE' }),
    ).toThrow(BadRequestException);

    const cancelledCtx = { ...baseContext, currentStatus: OnboardingStatus.CANCELLED };
    expect(() =>
      OnboardingStateMachine.transition(cancelledCtx, { type: 'SUBMIT_DATA' }),
    ).toThrow(BadRequestException);
  });
});
