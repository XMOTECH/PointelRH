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
exports.PointageController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const pointage_service_1 = require("./pointage.service");
const clock_in_dto_1 = require("./dto/clock-in.dto");
const clock_out_dto_1 = require("./dto/clock-out.dto");
const punch_dto_1 = require("./dto/punch.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PointageController = class PointageController {
    pointageService;
    constructor(pointageService) {
        this.pointageService = pointageService;
    }
    async punch(user, queryCompanyId, punchDto) {
        const explicitCompanyId = queryCompanyId || punchDto.companyId || punchDto.company_id || user?.companyId;
        const result = await this.pointageService.punch(punchDto, explicitCompanyId);
        return {
            success: true,
            ...result,
        };
    }
    async clockIn(user, queryCompanyId, clockInDto) {
        const companyId = queryCompanyId || clockInDto.companyId || clockInDto.company_id || clockInDto.payload?.companyId || clockInDto.payload?.company_id || user?.companyId;
        const attendance = await this.pointageService.clockIn(companyId, clockInDto);
        return {
            success: true,
            message: 'Pointage enregistré avec succès',
            data: attendance,
        };
    }
    async clockOut(user, clockOutDto) {
        const employeeId = clockOutDto?.employee_id || clockOutDto?.employeeId || user?.employeeId || user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('ID employé manquant pour le pointage de sortie');
        }
        const attendance = await this.pointageService.clockOut(employeeId, clockOutDto);
        return {
            success: true,
            message: 'Pointage de sortie enregistré',
            data: attendance,
        };
    }
    async getMyToday(user, queryEmployeeId) {
        const targetId = queryEmployeeId || user?.employeeId || user?.id;
        if (!targetId) {
            return { success: true, data: null };
        }
        const attendance = await this.pointageService.getTodayStatus(targetId);
        return {
            success: true,
            data: attendance,
        };
    }
    async getToday(companyId, departmentId, locationId, date) {
        const attendances = await this.pointageService.getHistory(companyId, {
            departmentId,
            locationId,
            date,
        });
        return {
            success: true,
            data: attendances,
        };
    }
    async getByEmployeeIds(companyId, employeeIdsStr) {
        if (!employeeIdsStr) {
            return { success: true, data: [] };
        }
        const employeeIds = employeeIdsStr.split(',').map(id => id.trim()).filter(Boolean);
        const attendances = await this.pointageService.getByEmployeeIds(companyId, employeeIds);
        return {
            success: true,
            data: attendances,
        };
    }
    async getLive(companyId, departmentId, locationId, date) {
        return this.getToday(companyId, departmentId, locationId, date);
    }
    async getByEmployee(user, id) {
        if (user.role === 'employee' && user.employeeId !== id) {
            throw new common_1.ForbiddenException('Vous n\'avez pas l\'autorisation de consulter l\'historique de ce collaborateur.');
        }
        const attendances = await this.pointageService.getHistory(user.companyId, {
            employeeId: id,
        });
        return {
            success: true,
            data: attendances,
        };
    }
};
exports.PointageController = PointageController;
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('punch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Pointage universel intelligent (Smart Punch / Toggle)',
        description: 'Bascule automatiquement entre Entrée et Sortie selon l\'état de la session active de l\'employé, sans provoquer d\'erreur 409.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'company_id', required: false, description: 'UUID de l\'entreprise' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pointage enregistré avec succès (Entrée ou Sortie).' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('company_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, punch_dto_1.PunchDto]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "punch", null);
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('clock-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Enregistrer une entrée (Clock In)',
        description: 'Enregistre le pointage d\'arrivée d\'un employé via PIN, QR Code, Reconnaissance Faciale ou Web.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'company_id', required: false, description: 'UUID de l\'entreprise (peut également être passé dans le payload)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pointage enregistré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides ou pointage en dehors de la zone de géolocalisation autorisée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('company_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, clock_in_dto_1.ClockInDto]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "clockIn", null);
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('clock-out'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Enregistrer une sortie (Clock Out)',
        description: 'Enregistre le pointage de départ d\'un employé via kiosque (PIN/Face) ou utilisateur connecté.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pointage de sortie enregistré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Aucun pointage d\'arrivée actif trouvé pour aujourd\'hui ou coordonnées invalides.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto,
        clock_out_dto_1.ClockOutDto]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "clockOut", null);
__decorate([
    (0, common_1.Get)('attendances/my-today'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir mon statut de pointage du jour',
        description: 'Retourne le pointage d\'arrivée (et éventuellement de sortie) de l\'employé connecté pour la date du jour.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut du pointage du jour récupéré.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('employee_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getMyToday", null);
__decorate([
    (0, common_1.Get)('attendances/today'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les pointages d\'aujourd\'hui',
        description: 'Récupère tous les pointages du jour pour l\'entreprise connectée, avec possibilité de filtres par département ou lieu géographique.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'Filtrer par UUID du département' }),
    (0, swagger_1.ApiQuery)({ name: 'location_id', required: false, description: 'Filtrer par UUID du lieu de travail' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Filtrer par date spécifique (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des pointages du jour récupérée.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('department_id')),
    __param(2, (0, common_1.Query)('location_id')),
    __param(3, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getToday", null);
__decorate([
    (0, common_1.Get)('attendances/by-employees'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les pointages par IDs d\'employés',
        description: 'Récupère l\'historique des pointages pour une liste d\'employés spécifiés par leurs UUIDs séparés par des virgules.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'employee_ids', required: true, description: 'UUIDs des employés séparés par des virgules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pointages récupérés avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('employee_ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getByEmployeeIds", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Flux en temps réel des pointages',
        description: 'Récupère un aperçu en direct des pointages de la journée (alias de la route de récupération historique du jour).',
    }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'Filtrer par UUID du département' }),
    (0, swagger_1.ApiQuery)({ name: 'location_id', required: false, description: 'Filtrer par UUID du lieu' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Filtrer par date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Flux en direct récupéré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('department_id')),
    __param(2, (0, common_1.Query)('location_id')),
    __param(3, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getLive", null);
__decorate([
    (0, common_1.Get)('attendances/employee/:id'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les pointages d\'un employé spécifique',
        description: 'Récupère l\'historique complet des pointages pour un employé donné de la même entreprise. Les employés simples ne peuvent consulter que leur propre historique.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé ciblé' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historique des pointages de l\'employé récupéré.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getByEmployee", null);
exports.PointageController = PointageController = __decorate([
    (0, swagger_1.ApiTags)('Pointages'),
    (0, common_1.Controller)('pointage'),
    __metadata("design:paramtypes", [pointage_service_1.PointageService])
], PointageController);
//# sourceMappingURL=pointage.controller.js.map