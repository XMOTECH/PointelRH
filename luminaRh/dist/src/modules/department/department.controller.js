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
exports.DepartmentController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const department_service_1 = require("./department.service");
const create_department_dto_1 = require("./dto/create-department.dto");
const update_department_dto_1 = require("./dto/update-department.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DepartmentController = class DepartmentController {
    departmentService;
    constructor(departmentService) {
        this.departmentService = departmentService;
    }
    async create(companyId, dto) {
        const department = await this.departmentService.create(companyId, dto);
        return {
            success: true,
            message: 'Département créé avec succès',
            data: department,
        };
    }
    async findAll(companyId) {
        const departments = await this.departmentService.findAll(companyId);
        return {
            success: true,
            data: departments,
        };
    }
    async findOne(companyId, id) {
        const department = await this.departmentService.findOne(companyId, id);
        return {
            success: true,
            data: department,
        };
    }
    async update(companyId, id, dto) {
        const department = await this.departmentService.update(companyId, id, dto);
        return {
            success: true,
            message: 'Département mis à jour avec succès',
            data: department,
        };
    }
    async remove(companyId, id) {
        await this.departmentService.remove(companyId, id);
        return {
            success: true,
            message: 'Département supprimé avec succès',
        };
    }
};
exports.DepartmentController = DepartmentController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un département' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Département créé avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les départements' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des départements récupérée avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un département' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Département trouvé.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un département' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Département mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_department_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un département' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Département supprimé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "remove", null);
exports.DepartmentController = DepartmentController = __decorate([
    (0, swagger_1.ApiTags)('Departments'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('departments'),
    __metadata("design:paramtypes", [department_service_1.DepartmentService])
], DepartmentController);
//# sourceMappingURL=department.controller.js.map