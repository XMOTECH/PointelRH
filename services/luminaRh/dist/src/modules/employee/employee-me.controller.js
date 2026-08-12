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
exports.EmployeeMeController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const employee_service_1 = require("./employee.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let EmployeeMeController = class EmployeeMeController {
    employeeService;
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    async getMe(user) {
        if (!user.employeeId) {
            throw new common_1.NotFoundException('Aucun profil employé associé à cet utilisateur.');
        }
        const employee = await this.employeeService.findOne(user.companyId, user.employeeId);
        return {
            success: true,
            data: employee,
        };
    }
};
exports.EmployeeMeController = EmployeeMeController;
__decorate([
    (0, common_1.Get)('me'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir mon propre profil',
        description: 'Récupère les détails complets du profil de l\'employé connecté.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails du profil récupérés.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aucun profil employé associé.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto]),
    __metadata("design:returntype", Promise)
], EmployeeMeController.prototype, "getMe", null);
exports.EmployeeMeController = EmployeeMeController = __decorate([
    (0, swagger_1.ApiTags)('Employee (Self)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('employee'),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService])
], EmployeeMeController);
//# sourceMappingURL=employee-me.controller.js.map