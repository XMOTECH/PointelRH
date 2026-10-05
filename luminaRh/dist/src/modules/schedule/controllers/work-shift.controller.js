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
exports.WorkShiftController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const work_shift_service_1 = require("../services/work-shift.service");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const dto_1 = require("../dto");
let WorkShiftController = class WorkShiftController {
    workShiftService;
    constructor(workShiftService) {
        this.workShiftService = workShiftService;
    }
    async create(companyId, userId, dto) {
        const result = await this.workShiftService.create(companyId, dto, userId);
        return {
            success: true,
            data: result.shift,
            violations: result.violations,
        };
    }
    async update(companyId, userId, id, dto) {
        const result = await this.workShiftService.update(companyId, id, dto, userId);
        return {
            success: true,
            data: result.shift,
            violations: result.violations,
        };
    }
    async move(companyId, userId, id, dto) {
        const result = await this.workShiftService.move(companyId, id, dto, userId);
        return {
            success: true,
            data: result.shift,
            violations: result.violations,
        };
    }
    async remove(companyId, id) {
        return this.workShiftService.remove(companyId, id);
    }
};
exports.WorkShiftController = WorkShiftController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un nouveau shift',
        description: 'Crée un créneau de travail planifié (assigné ou ouvert) avec évaluation de conformité en temps réel.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Shift créé avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CreateShiftDto]),
    __metadata("design:returntype", Promise)
], WorkShiftController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier un shift existant',
        description: 'Met à jour les horaires, la pause, le collaborateur ou les notes d\'un shift.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du shift' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shift modifié.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, dto_1.UpdateShiftDto]),
    __metadata("design:returntype", Promise)
], WorkShiftController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/move'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Déplacer rapidement un shift (Glisser-Déposer)',
        description: 'Permet de réassigner un shift à un autre collaborateur ou à une autre date instantanément.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du shift' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shift déplacé.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, dto_1.MoveShiftDto]),
    __metadata("design:returntype", Promise)
], WorkShiftController.prototype, "move", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un shift' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du shift' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shift supprimé.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkShiftController.prototype, "remove", null);
exports.WorkShiftController = WorkShiftController = __decorate([
    (0, swagger_1.ApiTags)('Shifts'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('shifts'),
    __metadata("design:paramtypes", [work_shift_service_1.WorkShiftService])
], WorkShiftController);
//# sourceMappingURL=work-shift.controller.js.map