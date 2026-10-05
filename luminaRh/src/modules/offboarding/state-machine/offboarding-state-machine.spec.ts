import { OffboardingStateMachine, OffboardingStateMachineContext } from './offboarding-state-machine';
import { OffboardingStatus } from '../entities/offboarding.enums';
import { BadRequestException } from '@nestjs/common';

describe('OffboardingStateMachine', () => {
  const baseContext: OffboardingStateMachineContext = {
    sessionId: 'session-123',
    currentStatus: OffboardingStatus.INITIATED,
    mandatoryTasksCompleted: true,
    lastWorkingDate: new Date('2026-10-31'),
    contractEndDate: new Date('2026-10-31'),
  };

  it('should transition from INITIATED to IN_PROGRESS on START_OFFBOARDING', () => {
    const next = OffboardingStateMachine.transition(baseContext, { type: 'START_OFFBOARDING' });
    expect(next).toBe(OffboardingStatus.IN_PROGRESS);
  });

  it('should transition from IN_PROGRESS to PENDING_DOCUMENTS when mandatory tasks are completed', () => {
    const context: OffboardingStateMachineContext = {
      ...baseContext,
      currentStatus: OffboardingStatus.IN_PROGRESS,
      mandatoryTasksCompleted: true,
    };
    const next = OffboardingStateMachine.transition(context, { type: 'SUBMIT_FOR_DOCUMENTS' });
    expect(next).toBe(OffboardingStatus.PENDING_DOCUMENTS);
  });

  it('should reject transition to PENDING_DOCUMENTS if mandatory tasks are incomplete', () => {
    const context: OffboardingStateMachineContext = {
      ...baseContext,
      currentStatus: OffboardingStatus.IN_PROGRESS,
      mandatoryTasksCompleted: false,
    };
    expect(() =>
      OffboardingStateMachine.transition(context, { type: 'SUBMIT_FOR_DOCUMENTS' }),
    ).toThrow(BadRequestException);
  });

  it('should transition from PENDING_DOCUMENTS to COMPLETED on COMPLETE_OFFBOARDING', () => {
    const context: OffboardingStateMachineContext = {
      ...baseContext,
      currentStatus: OffboardingStatus.PENDING_DOCUMENTS,
      mandatoryTasksCompleted: true,
    };
    const next = OffboardingStateMachine.transition(context, { type: 'COMPLETE_OFFBOARDING' });
    expect(next).toBe(OffboardingStatus.COMPLETED);
  });

  it('should allow reopening tasks from PENDING_DOCUMENTS back to IN_PROGRESS', () => {
    const context: OffboardingStateMachineContext = {
      ...baseContext,
      currentStatus: OffboardingStatus.PENDING_DOCUMENTS,
    };
    const next = OffboardingStateMachine.transition(context, { type: 'REOPEN_TASKS' });
    expect(next).toBe(OffboardingStatus.IN_PROGRESS);
  });

  it('should allow CANCEL from IN_PROGRESS', () => {
    const context: OffboardingStateMachineContext = {
      ...baseContext,
      currentStatus: OffboardingStatus.IN_PROGRESS,
    };
    const next = OffboardingStateMachine.transition(context, { type: 'CANCEL', reason: 'Rétractation acceptée' });
    expect(next).toBe(OffboardingStatus.CANCELLED);
  });

  it('should prevent invalid transitions (e.g. INITIATED directly to COMPLETED)', () => {
    expect(() =>
      OffboardingStateMachine.transition(baseContext, { type: 'COMPLETE_OFFBOARDING' }),
    ).toThrow(BadRequestException);
  });
});
