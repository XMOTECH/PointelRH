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
exports.PerformanceTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const performance_template_service_1 = require("../services/performance-template.service");
const create_performance_template_dto_1 = require("../dto/create-performance-template.dto");
let PerformanceTemplateController = class PerformanceTemplateController {
    templateService;
    constructor(templateService) {
        this.templateService = templateService;
    }
    async create(companyId, dto) {
        const data = await this.templateService.create(companyId, dto);
        return { success: true, data };
    }
    async findAll(companyId) {
        const data = await this.templateService.findAll(companyId);
        return { success: true, data };
    }
    async findOne(companyId, id) {
        const data = await this.templateService.findOne(companyId, id);
        return { success: true, data };
    }
    async update(companyId, id, dto) {
        const data = await this.templateService.update(companyId, id, dto);
        return { success: true, data };
    }
};
exports.PerformanceTemplateController = PerformanceTemplateController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau modèle d\'entretien d\'évaluation' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_performance_template_dto_1.CreatePerformanceTemplateDto]),
    __metadata("design:returntype", Promise)
], PerformanceTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les modèles d\'entretien disponibles' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter un modèle d\'entretien spécifique' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PerformanceTemplateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un modèle d\'entretien' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PerformanceTemplateController.prototype, "update", null);
exports.PerformanceTemplateController = PerformanceTemplateController = __decorate([
    (0, swagger_1.ApiTags)('Performance - Modèles & Formulaires'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('performance/templates'),
    __metadata("design:paramtypes", [performance_template_service_1.PerformanceTemplateService])
], PerformanceTemplateController);
//# sourceMappingURL=performance-template.controller.js.map