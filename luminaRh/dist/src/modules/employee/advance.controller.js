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
exports.AdvanceController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const advance_service_1 = require("./advance.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdvanceController = class AdvanceController {
    advanceService;
    constructor(advanceService) {
        this.advanceService = advanceService;
    }
    async createMyAdvance(user, body) {
        if (!user.employeeId) {
            throw new common_1.NotFoundException('Profil employé introuvable');
        }
        if (!body.amount || body.amount <= 0) {
            throw new common_1.BadRequestException('Le montant doit être supérieur à 0');
        }
        const request = await this.advanceService.create(user.employeeId, body.amount, body.type, body.reason);
        return {
            success: true,
            message: 'Demande soumise avec succès',
            data: request,
        };
    }
    async getMyAdvances(user) {
        if (!user.employeeId) {
            throw new common_1.NotFoundException('Profil employé introuvable');
        }
        const requests = await this.advanceService.findAllForEmployee(user.employeeId);
        return {
            success: true,
            data: requests,
        };
    }
    async getAllAdvances(companyId) {
        const requests = await this.advanceService.findAll(companyId);
        return {
            success: true,
            data: requests,
        };
    }
    async updateAdvanceStatus(companyId, id, body) {
        const updated = await this.advanceService.updateStatus(id, body.status, companyId);
        return {
            success: true,
            message: `Demande de prêt social mise à jour : ${body.status}`,
            data: updated,
        };
    }
};
exports.AdvanceController = AdvanceController;
__decorate([
    (0, swagger_1.ApiTags)('Employee (Self)'),
    (0, common_1.Post)('employee/my-advances'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Demander un acompte ou prêt social',
        description: 'Permet au collaborateur de soumettre de manière confidentielle une demande d\'aide financière.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdvanceController.prototype, "createMyAdvance", null);
__decorate([
    (0, swagger_1.ApiTags)('Employee (Self)'),
    (0, common_1.Get)('employee/my-advances'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter mes demandes d\'acomptes/prêts',
        description: 'Récupère la liste de toutes les demandes de prêts ou acomptes effectuées par le salarié.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto]),
    __metadata("design:returntype", Promise)
], AdvanceController.prototype, "getMyAdvances", null);
__decorate([
    (0, swagger_1.ApiTags)('Employees'),
    (0, common_1.Get)(['employees/advances', 'advances']),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister toutes les demandes d\'acomptes/prêts de l\'entreprise',
        description: 'Récupère la liste de toutes les requêtes sociales en attente ou traitées de l\'organisation.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdvanceController.prototype, "getAllAdvances", null);
__decorate([
    (0, swagger_1.ApiTags)('Employees'),
    (0, common_1.Patch)(['employees/advances/:id/status', 'advances/:id/status']),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Valider ou rejeter une demande de prêt social',
        description: 'Permet au RH d\'accepter (approved) ou de refuser (rejected) la demande de financement.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdvanceController.prototype, "updateAdvanceStatus", null);
exports.AdvanceController = AdvanceController = __decorate([
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [advance_service_1.AdvanceService])
], AdvanceController);
//# sourceMappingURL=advance.controller.js.map