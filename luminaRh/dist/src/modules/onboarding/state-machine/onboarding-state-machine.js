"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingStateMachine = void 0;
const common_1 = require("@nestjs/common");
const onboarding_enums_1 = require("../entities/onboarding.enums");
class OnboardingStateMachine {
    static ALLOWED_TRANSITIONS = {
        [onboarding_enums_1.OnboardingStatus.DRAFT]: [onboarding_enums_1.OnboardingStatus.INVITED, onboarding_enums_1.OnboardingStatus.CANCELLED],
        [onboarding_enums_1.OnboardingStatus.INVITED]: [onboarding_enums_1.OnboardingStatus.COLLECTING_DATA, onboarding_enums_1.OnboardingStatus.CANCELLED],
        [onboarding_enums_1.OnboardingStatus.COLLECTING_DATA]: [onboarding_enums_1.OnboardingStatus.IN_REVIEW, onboarding_enums_1.OnboardingStatus.CANCELLED],
        [onboarding_enums_1.OnboardingStatus.IN_REVIEW]: [
            onboarding_enums_1.OnboardingStatus.PROVISIONING,
            onboarding_enums_1.OnboardingStatus.COLLECTING_DATA,
            onboarding_enums_1.OnboardingStatus.CANCELLED,
        ],
        [onboarding_enums_1.OnboardingStatus.PROVISIONING]: [onboarding_enums_1.OnboardingStatus.READY_FOR_DAY_ONE, onboarding_enums_1.OnboardingStatus.CANCELLED],
        [onboarding_enums_1.OnboardingStatus.READY_FOR_DAY_ONE]: [onboarding_enums_1.OnboardingStatus.IN_ORIENTATION, onboarding_enums_1.OnboardingStatus.CANCELLED],
        [onboarding_enums_1.OnboardingStatus.IN_ORIENTATION]: [onboarding_enums_1.OnboardingStatus.COMPLETED, onboarding_enums_1.OnboardingStatus.CANCELLED],
        [onboarding_enums_1.OnboardingStatus.COMPLETED]: [],
        [onboarding_enums_1.OnboardingStatus.CANCELLED]: [],
    };
    static canTransition(from, to) {
        const allowed = this.ALLOWED_TRANSITIONS[from] || [];
        return allowed.includes(to);
    }
    static transition(context, event) {
        const { currentStatus } = context;
        switch (event.type) {
            case 'INVITE_CANDIDATE': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.INVITED);
                return onboarding_enums_1.OnboardingStatus.INVITED;
            }
            case 'ACCESS_MAGIC_LINK': {
                if (currentStatus === onboarding_enums_1.OnboardingStatus.INVITED) {
                    return onboarding_enums_1.OnboardingStatus.COLLECTING_DATA;
                }
                return currentStatus;
            }
            case 'SUBMIT_DATA': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.IN_REVIEW);
                return onboarding_enums_1.OnboardingStatus.IN_REVIEW;
            }
            case 'APPROVE_REVIEW': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.PROVISIONING);
                if (!context.mandatoryDocsValidated) {
                    throw new common_1.BadRequestException('Impossible de passer au provisionnement : des pièces justificatives obligatoires sont manquantes ou non validées.');
                }
                if (context.hasRejectedDocs) {
                    throw new common_1.BadRequestException('Impossible de passer au provisionnement : des pièces justificatives sont rejetées et doivent être corrigées.');
                }
                return onboarding_enums_1.OnboardingStatus.PROVISIONING;
            }
            case 'REJECT_REVIEW': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.COLLECTING_DATA);
                return onboarding_enums_1.OnboardingStatus.COLLECTING_DATA;
            }
            case 'COMPLETE_PROVISIONING': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.READY_FOR_DAY_ONE);
                if (!context.requiredPreDayOneTasksCompleted) {
                    throw new common_1.BadRequestException('Impossible de marquer prêt pour le Jour J : des tâches préalables obligatoires ne sont pas terminées.');
                }
                return onboarding_enums_1.OnboardingStatus.READY_FOR_DAY_ONE;
            }
            case 'START_ORIENTATION': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.IN_ORIENTATION);
                const now = context.now || new Date();
                const start = new Date(context.targetStartDate);
                if (start.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
                    throw new common_1.BadRequestException(`Impossible de démarrer l'orientation avant la date d'embauche prévue (${start.toISOString().split('T')[0]}).`);
                }
                return onboarding_enums_1.OnboardingStatus.IN_ORIENTATION;
            }
            case 'COMPLETE_ONBOARDING': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.COMPLETED);
                return onboarding_enums_1.OnboardingStatus.COMPLETED;
            }
            case 'CANCEL': {
                this.assertTransition(currentStatus, onboarding_enums_1.OnboardingStatus.CANCELLED);
                return onboarding_enums_1.OnboardingStatus.CANCELLED;
            }
            default:
                throw new common_1.BadRequestException(`Événement d'onboarding non reconnu.`);
        }
    }
    static assertTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new common_1.BadRequestException(`Transition de statut invalide : impossible de passer de '${from}' à '${to}'.`);
        }
    }
}
exports.OnboardingStateMachine = OnboardingStateMachine;
//# sourceMappingURL=onboarding-state-machine.js.map