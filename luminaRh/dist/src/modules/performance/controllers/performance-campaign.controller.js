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
exports.PerformanceCampaignController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const performance_campaign_service_1 = require("../services/performance-campaign.service");
const create_performance_campaign_dto_1 = require("../dto/create-performance-campaign.dto");
let PerformanceCampaignController = class PerformanceCampaignController {
    campaignService;
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async create(companyId, dto) {
        const data = await this.campaignService.create(companyId, dto);
        return { success: true, data };
    }
    async getGlobalStats(companyId) {
        const data = await this.campaignService.getGlobalStats(companyId);
        return { success: true, data };
    }
    async findAll(companyId) {
        const data = await this.campaignService.findAll(companyId);
        return { success: true, data };
    }
    async findOne(companyId, id) {
        const data = await this.campaignService.findOne(companyId, id);
        return { success: true, data };
    }
    async close(companyId, id) {
        const data = await this.campaignService.closeCampaign(companyId, id);
        return { success: true, data };
    }
};
exports.PerformanceCampaignController = PerformanceCampaignController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lancer une nouvelle campagne d\'évaluation pour l\'entreprise' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_performance_campaign_dto_1.CreatePerformanceCampaignDto]),
    __metadata("design:returntype", Promise)
], PerformanceCampaignController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les indicateurs de performance globaux (KPIs RH)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceCampaignController.prototype, "getGlobalStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister toutes les campagnes d\'évaluation de l\'entreprise' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceCampaignController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter le détail d\'une campagne et le suivi des participants' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PerformanceCampaignController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Clôturer officiellement une campagne d\'évaluation' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PerformanceCampaignController.prototype, "close", null);
exports.PerformanceCampaignController = PerformanceCampaignController = __decorate([
    (0, swagger_1.ApiTags)('Performance - Campagnes d\'Évaluation'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('performance/campaigns'),
    __metadata("design:paramtypes", [performance_campaign_service_1.PerformanceCampaignService])
], PerformanceCampaignController);
//# sourceMappingURL=performance-campaign.controller.js.map