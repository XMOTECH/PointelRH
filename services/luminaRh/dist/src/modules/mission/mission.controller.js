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
exports.MissionController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const mission_service_1 = require("./mission.service");
const create_mission_dto_1 = require("./dto/create-mission.dto");
const update_mission_dto_1 = require("./dto/update-mission.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let MissionController = class MissionController {
    missionService;
    constructor(missionService) {
        this.missionService = missionService;
    }
    async findAll(companyId, departmentId, status) {
        const missions = await this.missionService.findAll(companyId, { departmentId, status });
        return {
            success: true,
            data: missions,
        };
    }
    async findOne(companyId, id) {
        const mission = await this.missionService.findOne(companyId, id);
        return {
            success: true,
            data: mission,
        };
    }
    async create(companyId, dto) {
        const mission = await this.missionService.create(companyId, dto);
        return {
            success: true,
            data: mission,
        };
    }
    async update(companyId, id, dto) {
        const mission = await this.missionService.update(companyId, id, dto);
        return {
            success: true,
            data: mission,
        };
    }
    async assignEmployees(companyId, id, employeeIds, comment) {
        const result = await this.missionService.assignEmployees(companyId, id, employeeIds, comment);
        return result;
    }
    async remove(companyId, id) {
        await this.missionService.remove(companyId, id);
        return {
            success: true,
            message: 'Mission supprimée avec succès',
        };
    }
    async uploadDocuments(companyId, id, files) {
        if (!files || !Array.isArray(files) || files.length === 0) {
            throw new common_1.BadRequestException('Liste de fichiers manquante ou invalide');
        }
        const docs = await this.missionService.uploadDocuments(companyId, id, files);
        return {
            success: true,
            data: docs,
        };
    }
    async deleteDocument(companyId, missionId, docId) {
        await this.missionService.deleteDocument(companyId, missionId, docId);
        return {
            success: true,
            message: 'Document supprimé avec succès',
        };
    }
};
exports.MissionController = MissionController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister toutes les missions', description: 'Récupère toutes les missions géographiques de l\'entreprise.' }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'Filtrer par département' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filtrer par statut' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des missions récupérée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('department_id')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Détails d\'une mission', description: 'Récupère les informations détaillées d\'une mission spécifique.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la mission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de la mission récupérés.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une mission', description: 'Crée une nouvelle mission géographique et y affecte optionnellement des employés.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mission créée avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_mission_dto_1.CreateMissionDto]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une mission', description: 'Met à jour les informations d\'une mission existante.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la mission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mission mise à jour.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_mission_dto_1.UpdateMissionDto]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Affecter des employés à une mission', description: 'Affecte un groupe d\'employés à la mission.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la mission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employés affectés avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('employee_ids')),
    __param(3, (0, common_1.Body)('comment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, String]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "assignEmployees", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une mission', description: 'Supprime définitivement une mission.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la mission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mission supprimée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter des pièces jointes à une mission', description: 'Ajoute des documents officiels ou fichiers à la mission.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la mission' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Fichiers ajoutés.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('files')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "uploadDocuments", null);
__decorate([
    (0, common_1.Delete)(':missionId/documents/:docId'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un document de mission', description: 'Retire un document lié à la mission.' }),
    (0, swagger_1.ApiParam)({ name: 'missionId', description: 'UUID de la mission' }),
    (0, swagger_1.ApiParam)({ name: 'docId', description: 'UUID du document' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document supprimé.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('missionId')),
    __param(2, (0, common_1.Param)('docId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "deleteDocument", null);
exports.MissionController = MissionController = __decorate([
    (0, swagger_1.ApiTags)('Missions (Manager)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('missions'),
    __metadata("design:paramtypes", [mission_service_1.MissionService])
], MissionController);
//# sourceMappingURL=mission.controller.js.map