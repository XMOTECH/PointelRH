import { BadRequestException } from '@nestjs/common';
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

export type OffboardingEvent =
  | { type: 'START_OFFBOARDING' }
  | { type: 'SUBMIT_FOR_DOCUMENTS' }
  | { type: 'REOPEN_TASKS' }
  | { type: 'COMPLETE_OFFBOARDING' }
  | { type: 'CANCEL'; reason: string };

export class OffboardingStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<OffboardingStatus, OffboardingStatus[]> = {
    [OffboardingStatus.INITIATED]: [OffboardingStatus.IN_PROGRESS, OffboardingStatus.CANCELLED],
    [OffboardingStatus.IN_PROGRESS]: [OffboardingStatus.PENDING_DOCUMENTS, OffboardingStatus.CANCELLED],
    [OffboardingStatus.PENDING_DOCUMENTS]: [
      OffboardingStatus.COMPLETED,
      OffboardingStatus.IN_PROGRESS,
      OffboardingStatus.CANCELLED,
    ],
    [OffboardingStatus.COMPLETED]: [],
    [OffboardingStatus.CANCELLED]: [],
  };

  public static canTransition(from: OffboardingStatus, to: OffboardingStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static transition(context: OffboardingStateMachineContext, event: OffboardingEvent): OffboardingStatus {
    const { currentStatus } = context;

    switch (event.type) {
      case 'START_OFFBOARDING': {
        this.assertTransition(currentStatus, OffboardingStatus.IN_PROGRESS);
        return OffboardingStatus.IN_PROGRESS;
      }

      case 'SUBMIT_FOR_DOCUMENTS': {
        this.assertTransition(currentStatus, OffboardingStatus.PENDING_DOCUMENTS);
        if (!context.mandatoryTasksCompleted) {
          throw new BadRequestException(
            'Impossible de passer en attente de documents : des tâches préalables obligatoires ne sont ni complétées ni dispensées.',
          );
        }
        return OffboardingStatus.PENDING_DOCUMENTS;
      }

      case 'REOPEN_TASKS': {
        this.assertTransition(currentStatus, OffboardingStatus.IN_PROGRESS);
        return OffboardingStatus.IN_PROGRESS;
      }

      case 'COMPLETE_OFFBOARDING': {
        this.assertTransition(currentStatus, OffboardingStatus.COMPLETED);
        if (!context.mandatoryTasksCompleted) {
          throw new BadRequestException(
            'Impossible de clôturer l\'offboarding : des tâches obligatoires restent à traiter.',
          );
        }
        return OffboardingStatus.COMPLETED;
      }

      case 'CANCEL': {
        this.assertTransition(currentStatus, OffboardingStatus.CANCELLED);
        return OffboardingStatus.CANCELLED;
      }

      default:
        throw new BadRequestException("Événement d'offboarding non reconnu.");
    }
  }

  private static assertTransition(from: OffboardingStatus, to: OffboardingStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Transition de statut invalide : impossible de passer de '${from}' à '${to}'.`,
      );
    }
  }
}
