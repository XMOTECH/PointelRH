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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getDashboard(companyId) {
        const stats = await this.analyticsService.getDashboardStats(companyId);
        return {
            success: true,
            data: stats,
        };
    }
    async getDepartments(companyId) {
        const stats = await this.analyticsService.getDepartmentStats(companyId);
        return {
            success: true,
            data: stats,
        };
    }
    async getPresenceTrend(companyId) {
        const stats = await this.analyticsService.getPresenceTrend(companyId);
        return {
            success: true,
            data: stats,
        };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les statistiques du tableau de bord',
        description: 'Consolide et retourne les indicateurs clés principaux de l\'entreprise (ex: taux de présence, retards, demandes de congés actives).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Indicateurs clés du tableau de bord récupérés avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('department-stats'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les statistiques par département',
        description: 'Retourne la répartition des effectifs et indicateurs de performance agrégés par département.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques par département récupérées avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDepartments", null);
__decorate([
    (0, common_1.Get)('presence'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir la tendance historique des présences',
        description: 'Retourne l\'évolution du taux de présence quotidien sur les 30 derniers jours.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historique de tendance de présence récupéré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPresenceTrend", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map