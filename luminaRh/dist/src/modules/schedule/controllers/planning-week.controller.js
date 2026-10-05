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
exports.PlanningWeekController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const planning_week_service_1 = require("../services/planning-week.service");
const work_shift_service_1 = require("../services/work-shift.service");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const planning_week_dto_1 = require("../dto/planning-week.dto");
let PlanningWeekController = class PlanningWeekController {
    planningWeekService;
    workShiftService;
    constructor(planningWeekService, workShiftService) {
        this.planningWeekService = planningWeekService;
        this.workShiftService = workShiftService;
    }
    async getWeek(companyId, date, departmentId) {
        const data = await this.planningWeekService.getOrCreateWeek(companyId, date, departmentId);
        return {
            success: true,
            data,
        };
    }
    async getMyShifts(companyId, userId, date) {
        const data = await this.planningWeekService.getMyShifts(companyId, userId, date);
        return {
            success: true,
            data,
        };
    }
    async publishWeek(companyId, userId, dto) {
        return this.planningWeekService.publishWeek(companyId, dto.weekStart, userId, dto.departmentId);
    }
    async duplicateWeek(companyId, userId, dto) {
        return this.planningWeekService.duplicateWeek(companyId, dto, userId);
    }
    async saveOverride(companyId, userId, body) {
        const employeeId = body.employee_id || body.employeeId;
        const date = body.date;
        const isOff = body.is_off ?? body.isOff;
        const startTime = body.start_time || body.startTime || '08:00';
        const endTime = body.end_time || body.endTime || '17:00';
        const reason = body.reason;
        if (isOff) {
            const existing = await this.workShiftService['prisma'].shift.findFirst({
                where: {
                    companyId,
                    employeeId,
                    date: new Date(date + 'T00:00:00Z'),
                },
            });
            if (existing) {
                await this.workShiftService.remove(companyId, existing.id);
            }
            return {
                success: true,
                message: 'Jour de repos enregistré.',
                data: { date, status: 'off', reason },
            };
        }
        const existing = await this.workShiftService['prisma'].shift.findFirst({
            where: {
                companyId,
                employeeId,
                date: new Date(date + 'T00:00:00Z'),
            },
        });
        if (existing) {
            const result = await this.workShiftService.update(companyId, existing.id, { startTime, endTime, notes: reason }, userId);
            return {
                success: true,
                message: 'Planning mis à jour.',
                data: result.shift,
                violations: result.violations,
            };
        }
        const result = await this.workShiftService.create(companyId, {
            employeeId,
            date,
            startTime,
            endTime,
            notes: reason,
        }, userId);
        return {
            success: true,
            message: 'Shift créé avec succès.',
            data: result.shift,
            violations: result.violations,
        };
    }
};
exports.PlanningWeekController = PlanningWeekController;
__decorate([
    (0, common_1.Get)('week'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer la matrice hebdomadaire complète du planning',
        description: 'Retourne la semaine consolidée avec shifts, congés, missions, alertes de conformité et compteurs d\'heures.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: true, description: 'Une date dans la semaine (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'Filtrer par département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matrice hebdomadaire récupérée avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PlanningWeekController.prototype, "getWeek", null);
__decorate([
    (0, common_1.Get)('my-shifts'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter mes shifts de travail (Espace Salarié)',
        description: 'Retourne les shifts publiés, congés et missions du collaborateur connecté pour la semaine.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Date de référence (YYYY-MM-DD), par défaut aujourd\'hui' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shifts de l\'employé récupérés.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PlanningWeekController.prototype, "getMyShifts", null);
__decorate([
    (0, common_1.Post)('week/publish'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Publier la semaine de planning',
        description: 'Fait passer la semaine et ses shifts de l\'état DRAFT à PUBLISHED, les rendant officiels et visibles.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Planning publié.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, planning_week_dto_1.PublishWeekDto]),
    __metadata("design:returntype", Promise)
], PlanningWeekController.prototype, "publishWeek", null);
__decorate([
    (0, common_1.Post)('week/duplicate'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Dupliquer une semaine vers une autre',
        description: 'Copie l\'intégralité des shifts d\'une semaine source vers une semaine cible avec recalcul des dates.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Semaine dupliquée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, planning_week_dto_1.DuplicateWeekDto]),
    __metadata("design:returntype", Promise)
], PlanningWeekController.prototype, "duplicateWeek", null);
__decorate([
    (0, common_1.Post)('override'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier rapidement le planning d\'un employé',
        description: 'Enregistre une modification réelle d\'horaire ou un jour de repos pour un collaborateur.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PlanningWeekController.prototype, "saveOverride", null);
exports.PlanningWeekController = PlanningWeekController = __decorate([
    (0, swagger_1.ApiTags)('Planning'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('planning'),
    __metadata("design:paramtypes", [planning_week_service_1.PlanningWeekService,
        work_shift_service_1.WorkShiftService])
], PlanningWeekController);
//# sourceMappingURL=planning-week.controller.js.map