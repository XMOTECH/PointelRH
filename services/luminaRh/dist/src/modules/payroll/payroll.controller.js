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
const generate_payroll_dto_1 = require("./dto/generate-payroll.dto");
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async generatePayrollRun(companyId, userId, dto) {
        const period = await this.payrollService.generatePayrollRun(companyId, dto.month, dto.year, userId);
        return {
            success: true,
            message: `Cycle de paie ${dto.month}/${dto.year} calculé avec succès`,
            data: period,
        };
    }
    async getPayrollPeriods(companyId) {
        const periods = await this.payrollService.getPayrollPeriods(companyId);
        return {
            success: true,
            data: periods,
        };
    }
    async getPayrollPeriod(companyId, periodId) {
        const period = await this.payrollService.getPayrollPeriod(companyId, periodId);
        return {
            success: true,
            data: period,
        };
    }
    async validatePeriod(companyId, userId, periodId) {
        const updated = await this.payrollService.validatePeriod(companyId, periodId, userId);
        return {
            success: true,
            message: 'Période de paie validée et verrouillée avec succès',
            data: updated,
        };
    }
    async markPeriodAsPaid(companyId, periodId) {
        const updated = await this.payrollService.markPeriodAsPaid(companyId, periodId);
        return {
            success: true,
            message: 'Période de paie marquée comme payée',
            data: updated,
        };
    }
    async exportBankTransfer(companyId, periodId, res) {
        const csvContent = await this.payrollService.exportBankTransfer(companyId, periodId);
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.header('Content-Disposition', `attachment; filename="virement-bancaire-${periodId}.csv"`);
        return csvContent;
    }
    async exportMobileMoney(companyId, periodId, res) {
        const csvContent = await this.payrollService.exportMobileMoney(companyId, periodId);
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.header('Content-Disposition', `attachment; filename="virement-wave-om-${periodId}.csv"`);
        return csvContent;
    }
    async getPayslip(companyId, payslipId) {
        const payslip = await this.payrollService.getPayslip(companyId, payslipId);
        return {
            success: true,
            data: payslip,
        };
    }
    async addVariable(companyId, body) {
        const variable = await this.payrollService.addVariable(companyId, body.employeeId, body.month, body.year, body.dto);
        return {
            success: true,
            message: 'Variable de paie enregistrée avec succès',
            data: variable,
        };
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
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        return csvContent;
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('run'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lancer ou recalculer le cycle de paie mensuel',
        description: 'Génère automatiquement les bulletins de tous les collaborateurs actifs en appliquant les barèmes légaux sénégalais (IPRES, CSS, CFCE, IR et Quotient Familial).',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, generate_payroll_dto_1.GeneratePayrollDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generatePayrollRun", null);
__decorate([
    (0, common_1.Get)('periods'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les périodes de paie de l\'entreprise' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollPeriods", null);
__decorate([
    (0, common_1.Get)('periods/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Détails d\'une période de paie avec tous les bulletins' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la période de paie' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollPeriod", null);
__decorate([
    (0, common_1.Post)('periods/:id/validate'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Valider et verrouiller une période de paie' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "validatePeriod", null);
__decorate([
    (0, common_1.Post)('periods/:id/mark-paid'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer la période de paie et les bulletins comme payés' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "markPeriodAsPaid", null);
__decorate([
    (0, common_1.Get)('periods/:id/export-bank'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Exporter le fichier d\'ordre de virement bancaire' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "exportBankTransfer", null);
__decorate([
    (0, common_1.Get)('periods/:id/export-mobile-money'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Exporter le fichier de paiement Mobile Money (Wave / Orange Money)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "exportMobileMoney", null);
__decorate([
    (0, common_1.Get)('payslips/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin', 'realm:employee'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter un bulletin de paie détaillé avec toutes ses rubriques' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du bulletin de paie' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayslip", null);
__decorate([
    (0, common_1.Post)('variables'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une prime ou retenue ponctuelle pour un employé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "addVariable", null);
__decorate([
    (0, common_1.Get)('pre-payroll'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter l\'état de pré-paie mensuel (Rétro-compatibilité)' }),
    (0, swagger_1.ApiQuery)({ name: 'monthYear', required: false, description: 'Format MM-YYYY' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('monthYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPrePayroll", null);
__decorate([
    (0, common_1.Get)('pre-payroll/export'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Exporter les variables de pré-paie en CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'monthYear', required: false, description: 'Format MM-YYYY' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('monthYear')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "exportCsv", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll Engine (Sénégal)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map