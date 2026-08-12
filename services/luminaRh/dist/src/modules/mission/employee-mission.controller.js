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
exports.EmployeeMissionController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const mission_service_1 = require("./mission.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let EmployeeMissionController = class EmployeeMissionController {
    missionService;
    constructor(missionService) {
        this.missionService = missionService;
    }
    async findMyMissions(user) {
        if (!user.employeeId) {
            return { success: true, data: [] };
        }
        const missions = await this.missionService.findMyMissions(user.employeeId);
        return {
            success: true,
            data: missions,
        };
    }
    async findMyMissionDetail(user, id) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const detail = await this.missionService.findMyMissionDetail(user.employeeId, user.companyId, id);
        return {
            success: true,
            data: detail,
        };
    }
};
exports.EmployeeMissionController = EmployeeMissionController;
__decorate([
    (0, common_1.Get)('my-missions'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister mes missions assignées', description: 'Récupère toutes les missions affectées à l\'employé connecté.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Missions récupérées.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto]),
    __metadata("design:returntype", Promise)
], EmployeeMissionController.prototype, "findMyMissions", null);
__decorate([
    (0, common_1.Get)('my-missions/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Détails d\'une de mes missions', description: 'Récupère les informations complètes d\'une mission de l\'employé, y compris ses tâches et ses collègues.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la mission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de la mission récupérés.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeMissionController.prototype, "findMyMissionDetail", null);
exports.EmployeeMissionController = EmployeeMissionController = __decorate([
    (0, swagger_1.ApiTags)('Missions (Employee)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('employee'),
    __metadata("design:paramtypes", [mission_service_1.MissionService])
], EmployeeMissionController);
//# sourceMappingURL=employee-mission.controller.js.map