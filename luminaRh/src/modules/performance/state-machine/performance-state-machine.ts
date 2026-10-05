import { BadRequestException } from '@nestjs/common';
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

export type PerformanceEvent =
  | { type: 'START_SELF_EVALUATION' }
  | { type: 'SUBMIT_SELF_EVALUATION' }
  | { type: 'REQUEST_REVISION'; reason: string }
  | { type: 'SUBMIT_MANAGER_REVIEW' }
  | { type: 'SIGN_AND_COMPLETE' }
  | { type: 'CANCEL'; reason: string };

export class PerformanceStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<EvaluationStatus, EvaluationStatus[]> = {
    [EvaluationStatus.NOT_STARTED]: [
      EvaluationStatus.SELF_EVALUATION,
      EvaluationStatus.CANCELLED,
    ],
    [EvaluationStatus.SELF_EVALUATION]: [
      EvaluationStatus.MANAGER_REVIEW,
      EvaluationStatus.CANCELLED,
    ],
    [EvaluationStatus.MANAGER_REVIEW]: [
      EvaluationStatus.CALIBRATION,
      EvaluationStatus.SELF_EVALUATION, // Return for rework/clarification
      EvaluationStatus.CANCELLED,
    ],
    [EvaluationStatus.CALIBRATION]: [
      EvaluationStatus.COMPLETED,
      EvaluationStatus.MANAGER_REVIEW, // Rework before final signature
      EvaluationStatus.CANCELLED,
    ],
    [EvaluationStatus.COMPLETED]: [],
    [EvaluationStatus.CANCELLED]: [],
  };

  public static canTransition(from: EvaluationStatus, to: EvaluationStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static transition(
    context: PerformanceStateMachineContext,
    event: PerformanceEvent,
  ): EvaluationStatus {
    const { currentStatus, campaignIsActive } = context;

    if (!campaignIsActive && event.type !== 'CANCEL') {
      throw new BadRequestException(
        'Action impossible : la campagne d\'évaluation associée est clôturée ou inactive.',
      );
    }

    switch (event.type) {
      case 'START_SELF_EVALUATION': {
        this.assertTransition(currentStatus, EvaluationStatus.SELF_EVALUATION);
        return EvaluationStatus.SELF_EVALUATION;
      }

      case 'SUBMIT_SELF_EVALUATION': {
        this.assertTransition(currentStatus, EvaluationStatus.MANAGER_REVIEW);
        if (!context.hasSelfReviewData) {
          throw new BadRequestException(
            'Impossible de soumettre l\'auto-évaluation sans avoir renseigné les réponses obligatoires.',
          );
        }
        return EvaluationStatus.MANAGER_REVIEW;
      }

      case 'REQUEST_REVISION': {
        this.assertTransition(currentStatus, EvaluationStatus.SELF_EVALUATION);
        return EvaluationStatus.SELF_EVALUATION;
      }

      case 'SUBMIT_MANAGER_REVIEW': {
        this.assertTransition(currentStatus, EvaluationStatus.CALIBRATION);
        if (!context.hasManagerReviewData) {
          throw new BadRequestException(
            'Impossible de valider l\'évaluation managériale sans avoir complété la grille d\'évaluation.',
          );
        }
        return EvaluationStatus.CALIBRATION;
      }

      case 'SIGN_AND_COMPLETE': {
        this.assertTransition(currentStatus, EvaluationStatus.COMPLETED);
        if (!context.isEmployeeSigned || !context.isManagerSigned) {
          throw new BadRequestException(
            'Impossible de clôturer l\'évaluation : la double signature (collaborateur et manager) est requise.',
          );
        }
        return EvaluationStatus.COMPLETED;
      }

      case 'CANCEL': {
        this.assertTransition(currentStatus, EvaluationStatus.CANCELLED);
        return EvaluationStatus.CANCELLED;
      }

      default:
        throw new BadRequestException('Événement de transition d\'évaluation non reconnu.');
    }
  }

  private static assertTransition(from: EvaluationStatus, to: EvaluationStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Transition de statut invalide : impossible de passer de '${from}' à '${to}'.`,
      );
    }
  }
}
