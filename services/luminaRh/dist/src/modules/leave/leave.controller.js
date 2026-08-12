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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const leave_service_1 = require("./leave.service");
const update_leave_status_dto_1 = require("./dto/update-leave-status.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let LeaveController = class LeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async findAllRequests(companyId) {
        const requests = await this.leaveService.findAllRequests(companyId);
        return {
            success: true,
            data: requests,
        };
    }
    async updateStatus(companyId, userId, id, dto) {
        const request = await this.leaveService.updateStatus(companyId, id, dto, userId);
        return {
            success: true,
            data: request,
        };
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister toutes les demandes de congés', description: 'Récupère toutes les demandes de congés des employés de l\'entreprise.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des demandes de congés récupérée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findAllRequests", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'une demande de congé', description: 'Approuve ou rejette une demande de congé.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la demande' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut mis à jour avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_leave_status_dto_1.UpdateLeaveStatusDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "updateStatus", null);
exports.LeaveController = LeaveController = __decorate([
    (0, swagger_1.ApiTags)('Leaves (Manager)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('leaves'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map