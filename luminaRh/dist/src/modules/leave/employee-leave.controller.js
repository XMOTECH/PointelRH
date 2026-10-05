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
exports.EmployeeLeaveController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const leave_service_1 = require("./leave.service");
const create_leave_dto_1 = require("./dto/create-leave.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let EmployeeLeaveController = class EmployeeLeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async findMyLeaves(user) {
        if (!user.employeeId) {
            return { success: true, data: [] };
        }
        const leaves = await this.leaveService.findMyLeaves(user.employeeId);
        return {
            success: true,
            data: leaves,
        };
    }
    async findMyBalance(user, year) {
        if (!user.employeeId) {
            return { success: true, data: [] };
        }
        const targetYear = year ? parseInt(year, 10) : 2026;
        const balance = await this.leaveService.findMyBalance(user.employeeId, targetYear);
        return {
            success: true,
            data: balance,
        };
    }
    async createMyLeave(user, dto) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const request = await this.leaveService.createMyLeave(user.employeeId, user.companyId, dto);
        return {
            success: true,
            data: request,
        };
    }
    async cancelMyLeave(user, id) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const result = await this.leaveService.cancelMyLeave(user.employeeId, id);
        return result;
    }
};
exports.EmployeeLeaveController = EmployeeLeaveController;
__decorate([
    (0, common_1.Get)('my-leaves'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister mes demandes de congés', description: 'Récupère toutes les demandes de congés soumises par l\'employé connecté.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Demandes récupérées.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto]),
    __metadata("design:returntype", Promise)
], EmployeeLeaveController.prototype, "findMyLeaves", null);
__decorate([
    (0, common_1.Get)('my-balance'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir mes soldes de congés', description: 'Récupère les soldes de congés de l\'employé connecté pour une année donnée.' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, description: 'Année du solde (par défaut 2026)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Soldes récupérés.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeLeaveController.prototype, "findMyBalance", null);
__decorate([
    (0, common_1.Post)('my-leaves'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Soumettre une demande de congé', description: 'Crée une demande de congé en attente de validation.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Demande soumise.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto,
        create_leave_dto_1.CreateLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], EmployeeLeaveController.prototype, "createMyLeave", null);
__decorate([
    (0, common_1.Delete)('my-leaves/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Annuler une demande de congé', description: 'Annule et supprime une demande de congé encore en attente.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la demande' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Demande annulée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeLeaveController.prototype, "cancelMyLeave", null);
exports.EmployeeLeaveController = EmployeeLeaveController = __decorate([
    (0, swagger_1.ApiTags)('Leaves (Employee)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('employee'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], EmployeeLeaveController);
//# sourceMappingURL=employee-leave.controller.js.map