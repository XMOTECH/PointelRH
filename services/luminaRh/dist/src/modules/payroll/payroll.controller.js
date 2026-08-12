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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const payroll_service_1 = require("./payroll.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async getPrePayroll(companyId, monthYear) {
        const data = await this.payrollService.getPrePayroll(companyId, monthYear);
        return {
            success: true,
            data,
        };
    }
    async exportCsv(companyId, monthYear, res) {
        const csvContent = await this.payrollService.exportPrePayrollToCsv(companyId, monthYear);
        const filename = `pre-payroll-${monthYear || new Date().toISOString().slice(0, 7)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(common_1.HttpStatus.OK).send(csvContent);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Get)('pre-payroll'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter l\'état de pré-paie mensuel',
        description: 'Calcule et consolide toutes les variables de paie du mois pour les employés actifs (heures sup, transport, acomptes).',
    }),
    (0, swagger_1.ApiQuery)({ name: 'monthYear', required: false, description: 'Format MM-YYYY (ex: 07-2026). Par défaut le mois en cours.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('monthYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPrePayroll", null);
__decorate([
    (0, common_1.Get)('pre-payroll/export'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Exporter les variables de pré-paie en CSV',
        description: 'Génère et télécharge le fichier CSV consolidé des variables de paie prêt à être importé.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'monthYear', required: false, description: 'Format MM-YYYY (ex: 07-2026).' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('monthYear')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "exportCsv", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map