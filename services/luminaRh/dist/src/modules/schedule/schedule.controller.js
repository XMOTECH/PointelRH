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
exports.ScheduleController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const schedule_service_1 = require("./schedule.service");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ScheduleController = class ScheduleController {
    scheduleService;
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async create(companyId, dto) {
        const schedule = await this.scheduleService.create(companyId, dto);
        return {
            success: true,
            message: 'Horaire créé avec succès',
            data: schedule,
        };
    }
    async findAll(companyId) {
        const schedules = await this.scheduleService.findAll(companyId);
        return {
            success: true,
            data: schedules,
        };
    }
    async findOne(companyId, id) {
        const schedule = await this.scheduleService.findOne(companyId, id);
        return {
            success: true,
            data: schedule,
        };
    }
    async update(companyId, id, dto) {
        const schedule = await this.scheduleService.update(companyId, id, dto);
        return {
            success: true,
            message: 'Horaire mis à jour avec succès',
            data: schedule,
        };
    }
    async remove(companyId, id) {
        await this.scheduleService.remove(companyId, id);
        return {
            success: true,
            message: 'Horaire supprimé avec succès',
        };
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un horaire de travail' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Horaire créé avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_schedule_dto_1.CreateScheduleDto]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les horaires de travail' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des horaires récupérée avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un horaire' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'horaire' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horaire trouvé.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Horaire introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un horaire' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'horaire' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horaire mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Horaire introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_schedule_dto_1.UpdateScheduleDto]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un horaire' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'horaire' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horaire supprimé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Horaire introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "remove", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, swagger_1.ApiTags)('Schedules'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('schedules'),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService])
], ScheduleController);
//# sourceMappingURL=schedule.controller.js.map