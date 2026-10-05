import { BadRequestException } from '@nestjs/common';
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

export type OnboardingEvent =
  | { type: 'INVITE_CANDIDATE' }
  | { type: 'ACCESS_MAGIC_LINK' }
  | { type: 'SUBMIT_DATA' }
  | { type: 'APPROVE_REVIEW' }
  | { type: 'REJECT_REVIEW'; reason: string }
  | { type: 'COMPLETE_PROVISIONING' }
  | { type: 'START_ORIENTATION' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'CANCEL'; reason: string };

export class OnboardingStateMachine {
  /**
   * Transition graph defining allowed destination states from each state.
   */
  private static readonly ALLOWED_TRANSITIONS: Record<OnboardingStatus, OnboardingStatus[]> = {
    [OnboardingStatus.DRAFT]: [OnboardingStatus.INVITED, OnboardingStatus.CANCELLED],
    [OnboardingStatus.INVITED]: [OnboardingStatus.COLLECTING_DATA, OnboardingStatus.CANCELLED],
    [OnboardingStatus.COLLECTING_DATA]: [OnboardingStatus.IN_REVIEW, OnboardingStatus.CANCELLED],
    [OnboardingStatus.IN_REVIEW]: [
      OnboardingStatus.PROVISIONING,
      OnboardingStatus.COLLECTING_DATA, // Returned to candidate for corrections
      OnboardingStatus.CANCELLED,
    ],
    [OnboardingStatus.PROVISIONING]: [OnboardingStatus.READY_FOR_DAY_ONE, OnboardingStatus.CANCELLED],
    [OnboardingStatus.READY_FOR_DAY_ONE]: [OnboardingStatus.IN_ORIENTATION, OnboardingStatus.CANCELLED],
    [OnboardingStatus.IN_ORIENTATION]: [OnboardingStatus.COMPLETED, OnboardingStatus.CANCELLED],
    [OnboardingStatus.COMPLETED]: [], // Terminal state
    [OnboardingStatus.CANCELLED]: [], // Terminal state
  };

  /**
   * Check if a transition is structurally possible according to the graph.
   */
  public static canTransition(from: OnboardingStatus, to: OnboardingStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  /**
   * Pure deterministic function that takes current context & event and returns the next status.
   * Throws BadRequestException if transition or guards fail.
   */
  public static transition(context: StateMachineContext, event: OnboardingEvent): OnboardingStatus {
    const { currentStatus } = context;

    switch (event.type) {
      case 'INVITE_CANDIDATE': {
        this.assertTransition(currentStatus, OnboardingStatus.INVITED);
        return OnboardingStatus.INVITED;
      }

      case 'ACCESS_MAGIC_LINK': {
        if (currentStatus === OnboardingStatus.INVITED) {
          return OnboardingStatus.COLLECTING_DATA;
        }
        // If candidate re-accesses while already in collecting_data or later, keep current
        return currentStatus;
      }

      case 'SUBMIT_DATA': {
        this.assertTransition(currentStatus, OnboardingStatus.IN_REVIEW);
        return OnboardingStatus.IN_REVIEW;
      }

      case 'APPROVE_REVIEW': {
        this.assertTransition(currentStatus, OnboardingStatus.PROVISIONING);
        if (!context.mandatoryDocsValidated) {
          throw new BadRequestException(
            'Impossible de passer au provisionnement : des pièces justificatives obligatoires sont manquantes ou non validées.',
          );
        }
        if (context.hasRejectedDocs) {
          throw new BadRequestException(
            'Impossible de passer au provisionnement : des pièces justificatives sont rejetées et doivent être corrigées.',
          );
        }
        return OnboardingStatus.PROVISIONING;
      }

      case 'REJECT_REVIEW': {
        // Return dossier back to candidate for corrections
        this.assertTransition(currentStatus, OnboardingStatus.COLLECTING_DATA);
        return OnboardingStatus.COLLECTING_DATA;
      }

      case 'COMPLETE_PROVISIONING': {
        this.assertTransition(currentStatus, OnboardingStatus.READY_FOR_DAY_ONE);
        if (!context.requiredPreDayOneTasksCompleted) {
          throw new BadRequestException(
            'Impossible de marquer prêt pour le Jour J : des tâches préalables obligatoires ne sont pas terminées.',
          );
        }
        return OnboardingStatus.READY_FOR_DAY_ONE;
      }

      case 'START_ORIENTATION': {
        this.assertTransition(currentStatus, OnboardingStatus.IN_ORIENTATION);
        const now = context.now || new Date();
        const start = new Date(context.targetStartDate);
        // Start date check (cannot start orientation if start date is still in the future)
        if (start.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
          throw new BadRequestException(
            `Impossible de démarrer l'orientation avant la date d'embauche prévue (${start.toISOString().split('T')[0]}).`,
          );
        }
        return OnboardingStatus.IN_ORIENTATION;
      }

      case 'COMPLETE_ONBOARDING': {
        this.assertTransition(currentStatus, OnboardingStatus.COMPLETED);
        return OnboardingStatus.COMPLETED;
      }

      case 'CANCEL': {
        this.assertTransition(currentStatus, OnboardingStatus.CANCELLED);
        return OnboardingStatus.CANCELLED;
      }

      default:
        throw new BadRequestException(`Événement d'onboarding non reconnu.`);
    }
  }

  private static assertTransition(from: OnboardingStatus, to: OnboardingStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Transition de statut invalide : impossible de passer de '${from}' à '${to}'.`,
      );
    }
  }
}
