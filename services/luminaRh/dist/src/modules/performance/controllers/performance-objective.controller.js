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
exports.PerformanceObjectiveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const performance_objective_service_1 = require("../services/performance-objective.service");
const create_objective_dto_1 = require("../dto/create-objective.dto");
let PerformanceObjectiveController = class PerformanceObjectiveController {
    objectiveService;
    constructor(objectiveService) {
        this.objectiveService = objectiveService;
    }
    async create(companyId, user, dto) {
        const data = await this.objectiveService.create(companyId, user, dto);
        return { success: true, data };
    }
    async findAll(companyId, user, employeeId) {
        const data = await this.objectiveService.findAll(companyId, user, employeeId);
        return { success: true, data };
    }
    async update(companyId, id, user, dto) {
        const data = await this.objectiveService.update(companyId, id, user, dto);
        return { success: true, data };
    }
    async delete(companyId, id) {
        const data = await this.objectiveService.delete(companyId, id);
        return { success: true, data };
    }
};
exports.PerformanceObjectiveController = PerformanceObjectiveController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Assigner un nouvel objectif (individuel, d\'équipe ou stratégique)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, current_user_decorator_1.CurrentUserDto,
        create_objective_dto_1.CreateObjectiveDto]),
    __metadata("design:returntype", Promise)
], PerformanceObjectiveController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les objectifs fixés' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], PerformanceObjectiveController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour la progression ou le statut d\'un objectif' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, current_user_decorator_1.CurrentUserDto,
        create_objective_dto_1.UpdateObjectiveDto]),
    __metadata("design:returntype", Promise)
], PerformanceObjectiveController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un objectif' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PerformanceObjectiveController.prototype, "delete", null);
exports.PerformanceObjectiveController = PerformanceObjectiveController = __decorate([
    (0, swagger_1.ApiTags)('Performance - Objectifs & OKRs'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('performance/objectives'),
    __metadata("design:paramtypes", [performance_objective_service_1.PerformanceObjectiveService])
], PerformanceObjectiveController);
//# sourceMappingURL=performance-objective.controller.js.map