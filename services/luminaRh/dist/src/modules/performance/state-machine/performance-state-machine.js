"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceStateMachine = void 0;
const common_1 = require("@nestjs/common");
const performance_enums_1 = require("../entities/performance.enums");
class PerformanceStateMachine {
    static ALLOWED_TRANSITIONS = {
        [performance_enums_1.EvaluationStatus.NOT_STARTED]: [
            performance_enums_1.EvaluationStatus.SELF_EVALUATION,
            performance_enums_1.EvaluationStatus.CANCELLED,
        ],
        [performance_enums_1.EvaluationStatus.SELF_EVALUATION]: [
            performance_enums_1.EvaluationStatus.MANAGER_REVIEW,
            performance_enums_1.EvaluationStatus.CANCELLED,
        ],
        [performance_enums_1.EvaluationStatus.MANAGER_REVIEW]: [
            performance_enums_1.EvaluationStatus.CALIBRATION,
            performance_enums_1.EvaluationStatus.SELF_EVALUATION,
            performance_enums_1.EvaluationStatus.CANCELLED,
        ],
        [performance_enums_1.EvaluationStatus.CALIBRATION]: [
            performance_enums_1.EvaluationStatus.COMPLETED,
            performance_enums_1.EvaluationStatus.MANAGER_REVIEW,
            performance_enums_1.EvaluationStatus.CANCELLED,
        ],
        [performance_enums_1.EvaluationStatus.COMPLETED]: [],
        [performance_enums_1.EvaluationStatus.CANCELLED]: [],
    };
    static canTransition(from, to) {
        const allowed = this.ALLOWED_TRANSITIONS[from] || [];
        return allowed.includes(to);
    }
    static transition(context, event) {
        const { currentStatus, campaignIsActive } = context;
        if (!campaignIsActive && event.type !== 'CANCEL') {
            throw new common_1.BadRequestException('Action impossible : la campagne d\'évaluation associée est clôturée ou inactive.');
        }
        switch (event.type) {
            case 'START_SELF_EVALUATION': {
                this.assertTransition(currentStatus, performance_enums_1.EvaluationStatus.SELF_EVALUATION);
                return performance_enums_1.EvaluationStatus.SELF_EVALUATION;
            }
            case 'SUBMIT_SELF_EVALUATION': {
                this.assertTransition(currentStatus, performance_enums_1.EvaluationStatus.MANAGER_REVIEW);
                if (!context.hasSelfReviewData) {
                    throw new common_1.BadRequestException('Impossible de soumettre l\'auto-évaluation sans avoir renseigné les réponses obligatoires.');
                }
                return performance_enums_1.EvaluationStatus.MANAGER_REVIEW;
            }
            case 'REQUEST_REVISION': {
                this.assertTransition(currentStatus, performance_enums_1.EvaluationStatus.SELF_EVALUATION);
                return performance_enums_1.EvaluationStatus.SELF_EVALUATION;
            }
            case 'SUBMIT_MANAGER_REVIEW': {
                this.assertTransition(currentStatus, performance_enums_1.EvaluationStatus.CALIBRATION);
                if (!context.hasManagerReviewData) {
                    throw new common_1.BadRequestException('Impossible de valider l\'évaluation managériale sans avoir complété la grille d\'évaluation.');
                }
                return performance_enums_1.EvaluationStatus.CALIBRATION;
            }
            case 'SIGN_AND_COMPLETE': {
                this.assertTransition(currentStatus, performance_enums_1.EvaluationStatus.COMPLETED);
                if (!context.isEmployeeSigned || !context.isManagerSigned) {
                    throw new common_1.BadRequestException('Impossible de clôturer l\'évaluation : la double signature (collaborateur et manager) est requise.');
                }
                return performance_enums_1.EvaluationStatus.COMPLETED;
            }
            case 'CANCEL': {
                this.assertTransition(currentStatus, performance_enums_1.EvaluationStatus.CANCELLED);
                return performance_enums_1.EvaluationStatus.CANCELLED;
            }
            default:
                throw new common_1.BadRequestException('Événement de transition d\'évaluation non reconnu.');
        }
    }
    static assertTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new common_1.BadRequestException(`Transition de statut invalide : impossible de passer de '${from}' à '${to}'.`);
        }
    }
}
exports.PerformanceStateMachine = PerformanceStateMachine;
//# sourceMappingURL=performance-state-machine.js.map