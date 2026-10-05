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
exports.OnboardingSessionController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const onboarding_session_service_1 = require("../services/onboarding-session.service");
const onboarding_document_service_1 = require("../services/onboarding-document.service");
const create_session_dto_1 = require("../dto/create-session.dto");
const update_task_dto_1 = require("../dto/update-task.dto");
const review_document_dto_1 = require("../dto/review-document.dto");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
let OnboardingSessionController = class OnboardingSessionController {
    sessionService;
    documentService;
    constructor(sessionService, documentService) {
        this.sessionService = sessionService;
        this.documentService = documentService;
    }
    async create(companyId, creatorId, dto) {
        const session = await this.sessionService.createSession(companyId, dto, creatorId);
        return {
            success: true,
            message: 'Session d\'onboarding initiée avec succès',
            data: session,
        };
    }
    async findAll(companyId, status) {
        const sessions = await this.sessionService.findAll(companyId, status);
        return {
            success: true,
            data: sessions,
        };
    }
    async findOne(companyId, id) {
        const session = await this.sessionService.findOne(companyId, id);
        return {
            success: true,
            data: session,
        };
    }
    async updateTask(companyId, userId, sessionId, taskId, dto) {
        const updatedTask = await this.sessionService.updateTaskStatus(companyId, sessionId, taskId, userId, dto);
        return {
            success: true,
            message: 'Statut de la tâche mis à jour avec succès',
            data: updatedTask,
        };
    }
    async reviewDocument(companyId, reviewerId, docId, dto) {
        const reviewed = await this.documentService.reviewDocument(companyId, docId, reviewerId, dto);
        return {
            success: true,
            message: dto.status === 'VALIDATED' ? 'Document validé avec succès' : 'Document rejeté',
            data: reviewed,
        };
    }
    async approveReviewAndProvision(companyId, reviewerId, sessionId) {
        const result = await this.sessionService.approveReviewAndProvision(companyId, sessionId, reviewerId);
        return {
            success: true,
            message: 'Dossier approuvé et collaborateur provisionné pour le Jour J',
            data: result,
        };
    }
    async cancel(companyId, userId, sessionId, body) {
        const result = await this.sessionService.cancelSession(companyId, sessionId, body.reason || 'Annulation administrative', userId);
        return {
            success: true,
            message: 'Session d\'onboarding annulée',
            data: result,
        };
    }
};
exports.OnboardingSessionController = OnboardingSessionController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Initier une nouvelle session d\'onboarding',
        description: 'Instancie le parcours à partir d\'un modèle, clone les tâches DAG et génère le lien sécurisé Magic Link pour le candidat.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session initiée avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], OnboardingSessionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les sessions d\'onboarding de l\'entreprise' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filtrer par statut (INVITED, IN_REVIEW, READY_FOR_DAY_ONE...)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OnboardingSessionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir le détail complet d\'une session d\'onboarding' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la session' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OnboardingSessionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/tasks/:taskId'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour le statut d\'une tâche d\'onboarding',
        description: 'Valide ou rejette une tâche. Vérifie automatiquement les dépendances du graphe DAG.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('taskId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", Promise)
], OnboardingSessionController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Post)(':id/documents/:docId/review'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Examiner et valider/rejeter une pièce justificative',
        description: 'Permet aux RH ou HSE de valider ou rejeter un document (CNI, RIB, Certificat médical) avec motif.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('docId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, review_document_dto_1.ReviewDocumentDto]),
    __metadata("design:returntype", Promise)
], OnboardingSessionController.prototype, "reviewDocument", null);
__decorate([
    (0, common_1.Post)(':id/approve-provision'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Approuver la revue et déclencher le provisionnement (READY_FOR_DAY_ONE)',
        description: 'Valide le passage en provisionnement, calcule les parts fiscales, crée la fiche employé, le code PIN Kiosque et le solde de congés.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OnboardingSessionController.prototype, "approveReviewAndProvision", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Annuler une session d\'onboarding' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OnboardingSessionController.prototype, "cancel", null);
exports.OnboardingSessionController = OnboardingSessionController = __decorate([
    (0, swagger_1.ApiTags)('Onboarding Sessions'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('onboarding/sessions'),
    __metadata("design:paramtypes", [onboarding_session_service_1.OnboardingSessionService,
        onboarding_document_service_1.OnboardingDocumentService])
], OnboardingSessionController);
//# sourceMappingURL=onboarding-session.controller.js.map