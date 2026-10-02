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
exports.ShiftTemplateController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const shift_template_service_1 = require("../services/shift-template.service");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const shift_template_dto_1 = require("../dto/shift-template.dto");
let ShiftTemplateController = class ShiftTemplateController {
    templateService;
    constructor(templateService) {
        this.templateService = templateService;
    }
    async create(companyId, dto) {
        const data = await this.templateService.create(companyId, dto);
        return { success: true, data };
    }
    async findAll(companyId, departmentId) {
        const data = await this.templateService.findAll(companyId, departmentId);
        return { success: true, data };
    }
    async update(companyId, id, dto) {
        const data = await this.templateService.update(companyId, id, dto);
        return { success: true, data };
    }
    async remove(companyId, id) {
        await this.templateService.remove(companyId, id);
        return { success: true, message: 'Modèle désactivé.' };
    }
};
exports.ShiftTemplateController = ShiftTemplateController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un modèle de shift réutilisable' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Modèle créé avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_template_dto_1.CreateShiftTemplateDto]),
    __metadata("design:returntype", Promise)
], ShiftTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin', 'realm:employee'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les modèles de shifts de l\'entreprise' }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Modèles récupérés.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShiftTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un modèle de shift' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du modèle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Modèle mis à jour.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, shift_template_dto_1.UpdateShiftTemplateDto]),
    __metadata("design:returntype", Promise)
], ShiftTemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Désactiver un modèle de shift' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du modèle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Modèle désactivé.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShiftTemplateController.prototype, "remove", null);
exports.ShiftTemplateController = ShiftTemplateController = __decorate([
    (0, swagger_1.ApiTags)('Shift Templates'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('shift-templates'),
    __metadata("design:paramtypes", [shift_template_service_1.ShiftTemplateService])
], ShiftTemplateController);
//# sourceMappingURL=shift-template.controller.js.map