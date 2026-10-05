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
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const employee_service_1 = require("./employee.service");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const update_employee_dto_1 = require("./dto/update-employee.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
const escape_html_1 = require("../../common/utils/escape-html");
let EmployeeController = class EmployeeController {
    employeeService;
    prisma;
    constructor(employeeService, prisma) {
        this.employeeService = employeeService;
        this.prisma = prisma;
    }
    async create(companyId, createEmployeeDto) {
        const employee = await this.employeeService.create(companyId, createEmployeeDto);
        return {
            success: true,
            message: 'Employé créé avec succès',
            data: employee,
        };
    }
    async findAll(companyId, departmentId, status, contractType, role) {
        const employees = await this.employeeService.list(companyId, {
            departmentId,
            status,
            contractType,
            role,
        });
        return {
            success: true,
            data: employees,
        };
    }
    async findOne(companyId, id) {
        const employee = await this.employeeService.findOne(companyId, id);
        return {
            success: true,
            data: employee,
        };
    }
    async update(companyId, id, updateDto) {
        const employee = await this.employeeService.update(companyId, id, updateDto);
        return {
            success: true,
            message: 'Employé mis à jour avec succès',
            data: employee,
        };
    }
    async remove(companyId, id) {
        await this.employeeService.remove(companyId, id);
        return {
            success: true,
            message: 'Employé supprimé avec succès',
        };
    }
    async getFaceEnrollment(user, id) {
        if (user?.role === 'employee' && user?.employeeId !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez consulter que vos propres données faciales');
        }
        const status = await this.employeeService.getFaceEnrollment(id);
        return {
            success: true,
            data: status,
        };
    }
    async enrollFace(user, id, body) {
        if (user?.role === 'employee' && user?.employeeId !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez modifier que vos propres données faciales');
        }
        await this.employeeService.enrollFace(id, body.descriptors || []);
        return {
            success: true,
            message: 'Données faciales enregistrées avec succès',
        };
    }
    async deleteFaceEnrollment(user, id) {
        if (user?.role === 'employee' && user?.employeeId !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez supprimer que vos propres données faciales');
        }
        await this.employeeService.deleteFaceEnrollment(id);
        return {
            success: true,
            message: 'Données faciales supprimées avec succès',
        };
    }
    async generatePin(companyId, id) {
        const employee = await this.employeeService.generatePin(companyId, id);
        return {
            success: true,
            message: 'Code PIN généré avec succès',
            data: employee,
        };
    }
    async getWorkCertificate(companyId, id) {
        const employee = await this.employeeService.findOne(companyId, id);
        const today = (0, escape_html_1.escapeHtml)(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
        const hireDate = (0, escape_html_1.escapeHtml)(new Date(employee.hireDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
        const firstName = (0, escape_html_1.escapeHtml)(employee.firstName);
        const lastName = (0, escape_html_1.escapeHtml)(employee.lastName);
        const contractType = (0, escape_html_1.escapeHtml)(employee.contractType.toUpperCase());
        const departmentName = (0, escape_html_1.escapeHtml)(employee.department?.name || 'Collaborateur');
        const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Certificat de Travail - ${firstName} ${lastName}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 50px; }
          .header h1 { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; color: #0041c8; }
          .header p { margin: 5px 0; font-size: 12px; color: #666; }
          .title { text-align: center; font-size: 22px; font-weight: bold; margin: 40px 0; text-decoration: underline; text-transform: uppercase; }
          .content { font-size: 16px; text-align: justify; margin-bottom: 60px; }
          .signature-section { float: right; text-align: center; margin-right: 50px; margin-top: 40px; }
          .signature-title { font-weight: bold; margin-bottom: 80px; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background-color: #f7fafc; padding: 10px; border: 1px solid #edf2f7; border-radius: 6px; margin-bottom: 30px; text-align: center;">
          <button onclick="window.print()" style="background-color: #0041c8; color: white; border: none; padding: 8px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">Imprimer / Enregistrer en PDF</button>
        </div>
        
        <div class="header">
          <h1>LuminaRH</h1>
          <p>Direction des Ressources Humaines</p>
          <p>Dakar, Sénégal</p>
        </div>

        <div class="title">Certificat de Travail</div>

        <div class="content">
          <p>Je soussigné, Directeur des Ressources Humaines de la société LuminaRH, certifie par la présente que :</p>
          <p style="margin-left: 30px; font-weight: bold;">
            Monsieur / Madame ${firstName.toUpperCase()} ${lastName.toUpperCase()}<br>
            Demeurant à Dakar<br>
            Titulaire du contrat de type : ${contractType}
          </p>
          <p>a été employé(e) au sein de notre établissement du <strong>${hireDate}</strong> au <strong>${today}</strong>, en qualité de <strong>${departmentName}</strong>.</p>
          <p>Monsieur / Madame ${firstName} ${lastName} quitte notre société ce jour libre de tout engagement envers elle.</p>
          <p>En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.</p>
        </div>

        <div style="font-size: 14px; font-style: italic;">Fait à Dakar, le ${today}</div>

        <div class="signature-section">
          <div class="signature-title">La Direction des Ressources Humaines</div>
          <div style="border-top: 1px solid #666; width: 200px; margin-top: 50px;"></div>
        </div>
      </body>
      </html>
    `;
        return html;
    }
    async getSoldeDeToutCompte(companyId, id) {
        const employee = await this.employeeService.findOne(companyId, id);
        const today = (0, escape_html_1.escapeHtml)(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
        const firstName = (0, escape_html_1.escapeHtml)(employee.firstName);
        const lastName = (0, escape_html_1.escapeHtml)(employee.lastName);
        const departmentName = (0, escape_html_1.escapeHtml)(employee.department?.name || '—');
        const hireDateFormatted = (0, escape_html_1.escapeHtml)(new Date(employee.hireDate).toLocaleDateString('fr-FR'));
        const leaveBalance = await this.prisma.leaveBalance.findFirst({
            where: { employeeId: id },
            select: { remaining: true },
        });
        const remainingDays = Number(leaveBalance?.remaining || 0);
        const baseSalaryNum = Number(employee.baseSalary) || 0;
        const transportAllowanceNum = Number(employee.transportAllowance) || 0;
        const hourlyRate = baseSalaryNum > 0 ? baseSalaryNum / 173.33 : 0;
        const leaveAllowance = Math.round(remainingDays * 8 * hourlyRate);
        const totalNet = Math.round(baseSalaryNum + transportAllowanceNum + leaveAllowance);
        const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Solde de Tout Compte - ${firstName} ${lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0041c8; padding-bottom: 10px; }
          .header h1 { font-size: 24px; margin: 0; color: #0041c8; text-transform: uppercase; }
          .title { text-align: center; font-size: 20px; font-weight: bold; margin: 30px 0; text-transform: uppercase; }
          .meta-info { margin-bottom: 30px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #e6eeff; }
          .legal-text { font-size: 13px; text-align: justify; margin: 40px 0; line-height: 1.6; }
          .signature-box { display: flex; justify-content: space-between; margin-top: 50px; }
          .signature { border: 1px solid #ccc; width: 45%; height: 150px; padding: 10px; border-radius: 6px; box-sizing: border-box; }
          .signature-label { font-weight: bold; font-size: 12px; margin-bottom: 10px; text-transform: uppercase; text-align: center; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background-color: #f7fafc; padding: 10px; border: 1px solid #edf2f7; border-radius: 6px; margin-bottom: 30px; text-align: center;">
          <button onclick="window.print()" style="background-color: #0041c8; color: white; border: none; padding: 8px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">Imprimer / Enregistrer en PDF</button>
        </div>
        
        <div class="header">
          <h1>LuminaRH S.A.</h1>
          <p style="margin: 3px 0; font-size: 12px; color: #555;">Dossier de Sortie Réglementaire - Sénégal</p>
        </div>

        <div class="title">Reçu pour Solde de Tout Compte</div>

        <div class="meta-info">
          <p><strong>Nom du Collaborateur :</strong> ${firstName} ${lastName}</p>
          <p><strong>Département :</strong> ${departmentName}</p>
          <p><strong>Date d'embauche :</strong> ${hireDateFormatted}</p>
          <p><strong>Date de notification de sortie :</strong> ${today}</p>
        </div>

        <p>Je soussigné, <strong>${firstName} ${lastName}</strong>, reconnais avoir reçu de la société <strong>LuminaRH S.A.</strong>, pour solde de tout compte et de tout reliquat de rémunérations ou indemnités, la somme globale nette suivante :</p>

        <table>
          <thead>
            <tr>
              <th>Rubrique de Paie de Sortie</th>
              <th>Base de calcul</th>
              <th style="text-align: right;">Montant Net (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salaire du dernier mois travaillé (Base)</td>
              <td>Mensuel contractuel</td>
              <td style="text-align: right;">${baseSalaryNum.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr>
              <td>Indemnité compensatrice de transport</td>
              <td>Forfait mensuel légal</td>
              <td style="text-align: right;">${transportAllowanceNum.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr>
              <td>Indemnité compensatrice de congés payés restants</td>
              <td>${remainingDays} jours restants</td>
              <td style="text-align: right;">${leaveAllowance.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr class="total-row">
              <td>MONTANT TOTAL BRUT À PAYER</td>
              <td>Net à verser par virement</td>
              <td style="text-align: right; color: #0041c8;">${totalNet.toLocaleString('fr-FR')} FCFA</td>
            </tr>
          </tbody>
        </table>

        <div class="legal-text">
          <p>Le présent reçu pour solde de tout compte est établi en double exemplaire conformément aux dispositions du Code du travail de la République du Sénégal. J'ai bien noté que ce reçu peut être dénoncé par lettre recommandée dans un délai de deux (2) mois à compter de la date de signature, passé ce délai il devient libératoire pour l'employeur pour toutes les sommes qui y sont portées.</p>
        </div>

        <div class="signature-box">
          <div class="signature">
            <div class="signature-label">La Direction LuminaRH</div>
          </div>
          <div class="signature">
            <div class="signature-label">Le Salarié (précédé de la mention manuscrite "bon pour solde de tout compte")</div>
          </div>
        </div>
      </body>
      </html>
    `;
        return html;
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un nouvel employé',
        description: 'Crée un profil employé et synchronise un utilisateur correspondant dans Keycloak.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'L\'employé a été créé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides fournies.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les employés',
        description: 'Récupère la liste de tous les employés de la même entreprise avec possibilité de filtrage.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'UUID du département pour filtrer les employés' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Statut de l\'employé (active, inactive, suspended)' }),
    (0, swagger_1.ApiQuery)({ name: 'contract_type', required: false, description: 'Type de contrat (cdi, cdd, stage, interim)' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, description: 'Rôle d\'accès de l\'employé' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des employés récupérée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('department_id')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('contract_type')),
    __param(4, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les détails d\'un employé',
        description: 'Récupère les détails d\'un employé spécifique à partir de son identifiant.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID unique de l\'employé à récupérer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de l\'employé trouvés.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employé introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour un employé',
        description: 'Modifie les données d\'un profil d\'employé spécifique.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé à modifier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil de l\'employé mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données de mise à jour invalides.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employé introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_employee_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer un employé',
        description: 'Supprime définitivement un employé de la base de données et de Keycloak.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé à supprimer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employé supprimé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employé introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/face-enrollment'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir l\'état d\'enregistrement facial d\'un employé' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getFaceEnrollment", null);
__decorate([
    (0, common_1.Post)(':id/face-enrollment'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer les descripteurs faciaux d\'un employé' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "enrollFace", null);
__decorate([
    (0, common_1.Delete)(':id/face-enrollment'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer les données faciales d\'un employé' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "deleteFaceEnrollment", null);
__decorate([
    (0, common_1.Post)(':id/generate-pin'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Générer automatiquement un nouveau code PIN à 4 chiffres pour l\'employé' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "generatePin", null);
__decorate([
    (0, common_1.Get)(':id/documents/work-certificate'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Générer le certificat de travail au format imprimable' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé' }),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getWorkCertificate", null);
__decorate([
    (0, common_1.Get)(':id/documents/solde-de-tout-compte'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Générer le reçu de solde de tout compte au format imprimable' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de l\'employé' }),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getSoldeDeToutCompte", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, swagger_1.ApiTags)('Employees'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService,
        prisma_service_1.PrismaService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map