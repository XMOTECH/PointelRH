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
exports.TimelineController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const timeline_service_1 = require("./timeline.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TimelineController = class TimelineController {
    timelineService;
    constructor(timelineService) {
        this.timelineService = timelineService;
    }
    async getTeamTimeline(companyId, start, end, departmentId) {
        const timeline = await this.timelineService.getTeamTimeline(companyId, start, end, departmentId);
        return {
            success: true,
            data: timeline,
        };
    }
    async getOccupancy(companyId, date, departmentId) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const timeline = await this.timelineService.getTeamTimeline(companyId, targetDate, targetDate, departmentId);
        const total = timeline.length;
        const working = timeline.filter(emp => emp.shifts.some((s) => s.date === targetDate && s.status === 'work')).length;
        const onLeave = timeline.filter(emp => emp.shifts.some((s) => s.date === targetDate && s.status === 'leave')).length;
        return {
            success: true,
            data: {
                date: targetDate,
                total,
                working,
                onLeave,
                absent: total - working - onLeave,
                occupancyRate: total > 0 ? Math.round((working / total) * 100) : 0,
            },
        };
    }
};
exports.TimelineController = TimelineController;
__decorate([
    (0, common_1.Get)('team'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer le planning équipe (timeline)',
        description: 'Retourne le planning hebdomadaire de tous les employés actifs avec leurs shifts, congés et missions.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, description: 'Date de début (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, description: 'Date de fin (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'Filtrer par département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Timeline récupérée avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __param(3, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TimelineController.prototype, "getTeamTimeline", null);
__decorate([
    (0, common_1.Get)('occupancy'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Taux d\'occupation',
        description: 'Retourne le taux d\'occupation pour une date donnée.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Date (YYYY-MM-DD), défaut: aujourd\'hui' }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'Filtrer par département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Taux d\'occupation calculé.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TimelineController.prototype, "getOccupancy", null);
exports.TimelineController = TimelineController = __decorate([
    (0, swagger_1.ApiTags)('Timeline / Planning'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('timeline'),
    __metadata("design:paramtypes", [timeline_service_1.TimelineService])
], TimelineController);
//# sourceMappingURL=timeline.controller.js.map