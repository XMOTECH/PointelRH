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
exports.OffboardingSessionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const offboarding_session_service_1 = require("../services/offboarding-session.service");
const create_offboarding_session_dto_1 = require("../dto/create-offboarding-session.dto");
const update_offboarding_task_dto_1 = require("../dto/update-offboarding-task.dto");
const save_exit_interview_dto_1 = require("../dto/save-exit-interview.dto");
let OffboardingSessionController = class OffboardingSessionController {
    sessionService;
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    async getStats(companyId) {
        const stats = await this.sessionService.getStats(companyId);
        return {
            success: true,
            data: stats,
        };
    }
    async findAll(companyId, status, departureReason, departmentId, search) {
        const sessions = await this.sessionService.findAll(companyId, {
            status,
            departureReason,
            departmentId,
            search,
        });
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
    async create(user, dto) {
        const session = await this.sessionService.createSession(user.companyId, dto, user.id, user.email);
        return {
            success: true,
            message: 'Procédure d\'offboarding initiée avec succès',
            data: session,
        };
    }
    async updateTask(user, taskId, dto) {
        const task = await this.sessionService.updateTask(user.companyId, taskId, dto, user.id, user.email);
        return {
            success: true,
            message: 'Tâche mise à jour',
            data: task,
        };
    }
    async saveExitInterview(user, sessionId, dto) {
        const session = await this.sessionService.saveExitInterview(user.companyId, sessionId, dto, user.id, user.email);
        return {
            success: true,
            message: 'Entretien de sortie enregistré avec succès',
            data: session,
        };
    }
    async saveHandover(user, sessionId, notes) {
        const session = await this.sessionService.saveHandoverNotes(user.companyId, sessionId, notes, user.id, user.email);
        return {
            success: true,
            message: 'Notes de passation enregistrées',
            data: session,
        };
    }
    async transition(user, sessionId, body) {
        const session = await this.sessionService.transitionStatus(user.companyId, sessionId, body.event, user.id, user.email);
        return {
            success: true,
            message: 'Statut mis à jour avec succès',
            data: session,
        };
    }
};
exports.OffboardingSessionController = OffboardingSessionController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les indicateurs clés (KPIs) de l\'offboarding' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister toutes les sessions d\'offboarding de l\'entreprise' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'departureReason', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'departmentId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('departureReason')),
    __param(3, (0, common_1.Query)('departmentId')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la vue 360° d\'une session d\'offboarding' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Initier une nouvelle procédure d\'offboarding' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto,
        create_offboarding_session_dto_1.CreateOffboardingSessionDto]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'une tâche de la checklist' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, update_offboarding_task_dto_1.UpdateOffboardingTaskDto]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Post)(':id/exit-interview'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer le compte-rendu de l\'entretien de sortie' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, save_exit_interview_dto_1.SaveExitInterviewDto]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "saveExitInterview", null);
__decorate([
    (0, common_1.Post)(':id/handover'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer les notes de passation de service' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, String]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "saveHandover", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Déclencher une transition dans la machine à états de l\'offboarding' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, Object]),
    __metadata("design:returntype", Promise)
], OffboardingSessionController.prototype, "transition", null);
exports.OffboardingSessionController = OffboardingSessionController = __decorate([
    (0, swagger_1.ApiTags)('Offboarding - Sessions'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('offboarding/sessions'),
    __metadata("design:paramtypes", [offboarding_session_service_1.OffboardingSessionService])
], OffboardingSessionController);
//# sourceMappingURL=offboarding-session.controller.js.map