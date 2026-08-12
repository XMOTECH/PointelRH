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
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const location_service_1 = require("./location.service");
const create_location_dto_1 = require("./dto/create-location.dto");
const update_location_dto_1 = require("./dto/update-location.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let LocationController = class LocationController {
    locationService;
    constructor(locationService) {
        this.locationService = locationService;
    }
    async create(companyId, dto) {
        const site = await this.locationService.create(companyId, dto);
        return {
            success: true,
            message: 'Site géographique créé avec succès',
            data: site,
        };
    }
    async findAll(companyId) {
        const sites = await this.locationService.findAll(companyId);
        return {
            success: true,
            data: sites,
        };
    }
    async findOne(companyId, id) {
        const site = await this.locationService.findOne(companyId, id);
        return {
            success: true,
            data: site,
        };
    }
    async update(companyId, id, dto) {
        const site = await this.locationService.update(companyId, id, dto);
        return {
            success: true,
            message: 'Site géographique mis à jour avec succès',
            data: site,
        };
    }
    async remove(companyId, id) {
        await this.locationService.remove(companyId, id);
        return {
            success: true,
            message: 'Site géographique supprimé avec succès',
        };
    }
    async generateQr(companyId, id) {
        const result = await this.locationService.generateQr(companyId, id);
        return {
            success: true,
            data: result,
        };
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un nouveau site de pointage',
        description: 'Crée un point géographique avec un rayon de géolocalisation pour le pointage mobile/kiosque.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Site créé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_location_dto_1.CreateLocationDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les sites de pointage',
        description: 'Récupère la liste de tous les sites géographiques de l\'entreprise.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des sites récupérée.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Détails d\'un site de pointage',
        description: 'Récupère les détails d\'un site géographique spécifique.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du site' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site trouvé.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour un site de pointage',
        description: 'Modifie les données d\'un site géographique.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du site' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_location_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer un site de pointage',
        description: 'Supprime un site géographique de la base de données.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du site' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site supprimé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/qr'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Régénérer le jeton QR d\'un site',
        description: 'Régénère le token de sécurité du QR Code pour invalider l\'ancien.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID du site' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'QR Token régénéré avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "generateQr", null);
exports.LocationController = LocationController = __decorate([
    (0, swagger_1.ApiTags)('Locations'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('locations'),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], LocationController);
//# sourceMappingURL=location.controller.js.map