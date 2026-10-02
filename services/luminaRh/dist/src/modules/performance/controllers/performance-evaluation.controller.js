"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceEvaluationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const performance_evaluation_service_1 = require("../services/performance-evaluation.service");
const submit_self_review_dto_1 = require("../dto/submit-self-review.dto");
const submit_manager_review_dto_1 = require("../dto/submit-manager-review.dto");
const sign_evaluation_dto_1 = require("../dto/sign-evaluation.dto");
let PerformanceEvaluationController = class PerformanceEvaluationController {
    evaluationService;
    constructor(evaluationService) {
        this.evaluationService = evaluationService;
    }
    async findAll(companyId, user, campaignId, status, employeeId) {
        const data = await this.evaluationService.findAll(companyId, user, {
            campaignId,
            status,
            employeeId,
        });
        return { success: true, data };
    }
    async findOne(companyId, id, user) {
        const data = await this.evaluationService.findOne(companyId, id, user);
        return { success: true, data };
    }
    async startSelfEvaluation(companyId, id, user) {
        const data = await this.evaluationService.startSelfEvaluation(companyId, id, user);
        return { success: true, data };
    }
    async saveDraftSelfReview(companyId, id, user, dto) {
        const data = await this.evaluationService.saveDraftSelfReview(companyId, id, user, dto);
        return { success: true, data };
    }
    async submitSelfReview(companyId, id, user, dto) {
        const data = await this.evaluationService.submitSelfReview(companyId, id, user, dto);
        return { success: true, data };
    }
    async submitManagerReview(companyId, id, user, dto) {
        const data = await this.evaluationService.submitManagerReview(companyId, id, user, dto);
        return { success: true, data };
    }
    async sign(companyId, id, user, dto) {
        const data = await this.evaluationService.signEvaluation(companyId, id, user, dto);
        return { success: true, data };
    }
};
exports.PerformanceEvaluationController = PerformanceEvaluationController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les évaluations accessibles à l\'utilisateur connecté (selon rôle et hiérarchie)' }),
    (0, swagger_1.ApiQuery)({ name: 'campaignId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('campaignId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, current_user_decorator_1.CurrentUserDto, String, String, String]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter une session d\'évaluation complète' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, current_user_decorator_1.CurrentUserDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/start-self-evaluation'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Démarrer formellement l\'auto-évaluation du collaborateur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, current_user_decorator_1.CurrentUserDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationController.prototype, "startSelfEvaluation", null);
__decorate([
    (0, common_1.Put)(':id/draft-self-review'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer un brouillon d\'auto-évaluation en cours de saisie' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, current_user_decorator_1.CurrentUserDto,
        submit_self_review_dto_1.SubmitSelfReviewDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationController.prototype, "saveDraftSelfReview", null);
__decorate([
    (0, common_1.Post)(':id/submit-self-review'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Soumettre définitivement l\'auto-évaluation au manager' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, current_user_decorator_1.CurrentUserDto,
        submit_self_review_dto_1.SubmitSelfReviewDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationController.prototype, "submitSelfReview", null);
__decorate([
    (0, common_1.Post)(':id/submit-manager-review'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Valider et soumettre l\'évaluation managériale' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, current_user_decorator_1.CurrentUserDto,
        submit_manager_review_dto_1.SubmitManagerReviewDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationController.prototype, "submitManagerReview", null);
__decorate([
    (0, common_1.Post)(':id/sign'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Signer électroniquement l\'entretien d\'évaluation (Collaborateur ou Manager)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, current_user_decorator_1.CurrentUserDto,
        sign_evaluation_dto_1.SignEvaluationDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationController.prototype, "sign", null);
exports.PerformanceEvaluationController = PerformanceEvaluationController = __decorate([
    (0, swagger_1.ApiTags)('Performance - Sessions d\'Évaluation'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('performance/evaluations'),
    __metadata("design:paramtypes", [performance_evaluation_service_1.PerformanceEvaluationService])
], PerformanceEvaluationController);
//# sourceMappingURL=performance-evaluation.controller.js.map