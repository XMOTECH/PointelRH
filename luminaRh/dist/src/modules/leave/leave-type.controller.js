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
exports.LeaveTypeController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const leave_service_1 = require("./leave.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let LeaveTypeController = class LeaveTypeController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async getLeaveTypes(companyId) {
        const types = await this.leaveService.getLeaveTypes(companyId);
        return {
            success: true,
            data: types,
        };
    }
};
exports.LeaveTypeController = LeaveTypeController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les types de congés disponibles', description: 'Récupère tous les types de congés actifs configurés pour l\'entreprise.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des types de congés récupérée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveTypeController.prototype, "getLeaveTypes", null);
exports.LeaveTypeController = LeaveTypeController = __decorate([
    (0, swagger_1.ApiTags)('Leave Types'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('leave-types'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveTypeController);
//# sourceMappingURL=leave-type.controller.js.map