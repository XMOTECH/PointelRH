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
exports.OnboardingTemplateController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const onboarding_template_service_1 = require("../services/onboarding-template.service");
const create_template_dto_1 = require("../dto/create-template.dto");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
let OnboardingTemplateController = class OnboardingTemplateController {
    templateService;
    constructor(templateService) {
        this.templateService = templateService;
    }
    async create(companyId, dto) {
        const template = await this.templateService.create(companyId, dto);
        return {
            success: true,
            message: 'Modèle d\'onboarding créé avec succès',
            data: template,
        };
    }
    async findAll(companyId) {
        const templates = await this.templateService.findAll(companyId);
        return {
            success: true,
            data: templates,
        };
    }
    async findOne(companyId, id) {
        const template = await this.templateService.findOne(companyId, id);
        return {
            success: true,
            data: template,
        };
    }
};
exports.OnboardingTemplateController = OnboardingTemplateController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un modèle de parcours d\'onboarding',
        description: 'Définit un nouveau modèle avec sa liste de tâches configurables par métier (Usine 3x8, Bureau, etc.).',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Modèle créé avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], OnboardingTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les modèles d\'onboarding de l\'entreprise',
        description: 'Renvoie tous les modèles actifs. Initialise automatiquement les modèles industriels par défaut si la liste est vide.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les détails d\'un modèle d\'onboarding' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du modèle' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OnboardingTemplateController.prototype, "findOne", null);
exports.OnboardingTemplateController = OnboardingTemplateController = __decorate([
    (0, swagger_1.ApiTags)('Onboarding Templates'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('onboarding/templates'),
    __metadata("design:paramtypes", [onboarding_template_service_1.OnboardingTemplateService])
], OnboardingTemplateController);
//# sourceMappingURL=onboarding-template.controller.js.map