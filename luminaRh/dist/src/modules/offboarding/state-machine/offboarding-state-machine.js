"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingStateMachine = void 0;
const common_1 = require("@nestjs/common");
const offboarding_enums_1 = require("../entities/offboarding.enums");
class OffboardingStateMachine {
    static ALLOWED_TRANSITIONS = {
        [offboarding_enums_1.OffboardingStatus.INITIATED]: [offboarding_enums_1.OffboardingStatus.IN_PROGRESS, offboarding_enums_1.OffboardingStatus.CANCELLED],
        [offboarding_enums_1.OffboardingStatus.IN_PROGRESS]: [offboarding_enums_1.OffboardingStatus.PENDING_DOCUMENTS, offboarding_enums_1.OffboardingStatus.CANCELLED],
        [offboarding_enums_1.OffboardingStatus.PENDING_DOCUMENTS]: [
            offboarding_enums_1.OffboardingStatus.COMPLETED,
            offboarding_enums_1.OffboardingStatus.IN_PROGRESS,
            offboarding_enums_1.OffboardingStatus.CANCELLED,
        ],
        [offboarding_enums_1.OffboardingStatus.COMPLETED]: [],
        [offboarding_enums_1.OffboardingStatus.CANCELLED]: [],
    };
    static canTransition(from, to) {
        const allowed = this.ALLOWED_TRANSITIONS[from] || [];
        return allowed.includes(to);
    }
    static transition(context, event) {
        const { currentStatus } = context;
        switch (event.type) {
            case 'START_OFFBOARDING': {
                this.assertTransition(currentStatus, offboarding_enums_1.OffboardingStatus.IN_PROGRESS);
                return offboarding_enums_1.OffboardingStatus.IN_PROGRESS;
            }
            case 'SUBMIT_FOR_DOCUMENTS': {
                this.assertTransition(currentStatus, offboarding_enums_1.OffboardingStatus.PENDING_DOCUMENTS);
                if (!context.mandatoryTasksCompleted) {
                    throw new common_1.BadRequestException('Impossible de passer en attente de documents : des tâches préalables obligatoires ne sont ni complétées ni dispensées.');
                }
                return offboarding_enums_1.OffboardingStatus.PENDING_DOCUMENTS;
            }
            case 'REOPEN_TASKS': {
                this.assertTransition(currentStatus, offboarding_enums_1.OffboardingStatus.IN_PROGRESS);
                return offboarding_enums_1.OffboardingStatus.IN_PROGRESS;
            }
            case 'COMPLETE_OFFBOARDING': {
                this.assertTransition(currentStatus, offboarding_enums_1.OffboardingStatus.COMPLETED);
                if (!context.mandatoryTasksCompleted) {
                    throw new common_1.BadRequestException('Impossible de clôturer l\'offboarding : des tâches obligatoires restent à traiter.');
                }
                return offboarding_enums_1.OffboardingStatus.COMPLETED;
            }
            case 'CANCEL': {
                this.assertTransition(currentStatus, offboarding_enums_1.OffboardingStatus.CANCELLED);
                return offboarding_enums_1.OffboardingStatus.CANCELLED;
            }
            default:
                throw new common_1.BadRequestException("Événement d'offboarding non reconnu.");
        }
    }
    static assertTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new common_1.BadRequestException(`Transition de statut invalide : impossible de passer de '${from}' à '${to}'.`);
        }
    }
}
exports.OffboardingStateMachine = OffboardingStateMachine;
//# sourceMappingURL=offboarding-state-machine.js.map