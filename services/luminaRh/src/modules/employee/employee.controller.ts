import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { escapeHtml } from '../../common/utils/escape-html';

@ApiTags('Employees')
@ApiBearerAuth('keycloak-token')
@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Créer un nouvel employé',
    description: 'Crée un profil employé et synchronise un utilisateur correspondant dans Keycloak.',
  })
  @ApiResponse({ status: 201, description: 'L\'employé a été créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides fournies.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, super_admin.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    const employee = await this.employeeService.create(companyId, createEmployeeDto);
    return {
      success: true,
      message: 'Employé créé avec succès',
      data: employee,
    };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lister les employés',
    description: 'Récupère la liste de tous les employés de la même entreprise avec possibilité de filtrage.',
  })
  @ApiQuery({ name: 'department_id', required: false, description: 'UUID du département pour filtrer les employés' })
  @ApiQuery({ name: 'status', required: false, description: 'Statut de l\'employé (active, inactive, suspended)' })
  @ApiQuery({ name: 'contract_type', required: false, description: 'Type de contrat (cdi, cdd, stage, interim)' })
  @ApiQuery({ name: 'role', required: false, description: 'Rôle d\'accès de l\'employé' })
  @ApiResponse({ status: 200, description: 'Liste des employés récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('department_id') departmentId?: string,
    @Query('status') status?: string,
    @Query('contract_type') contractType?: string,
    @Query('role') role?: string,
  ) {
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

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Obtenir les détails d\'un employé',
    description: 'Récupère les détails d\'un employé spécifique à partir de son identifiant.',
  })
  @ApiParam({ name: 'id', description: 'UUID unique de l\'employé à récupérer' })
  @ApiResponse({ status: 200, description: 'Détails de l\'employé trouvés.' })
  @ApiResponse({ status: 404, description: 'Employé introuvable.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const employee = await this.employeeService.findOne(companyId, id);
    return {
      success: true,
      data: employee,
    };
  }

  @Put(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Mettre à jour un employé',
    description: 'Modifie les données d\'un profil d\'employé spécifique.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé à modifier' })
  @ApiResponse({ status: 200, description: 'Profil de l\'employé mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données de mise à jour invalides.' })
  @ApiResponse({ status: 404, description: 'Employé introuvable.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    const employee = await this.employeeService.update(companyId, id, updateDto);
    return {
      success: true,
      message: 'Employé mis à jour avec succès',
      data: employee,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Supprimer un employé',
    description: 'Supprime définitivement un employé de la base de données et de Keycloak.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé à supprimer' })
  @ApiResponse({ status: 200, description: 'Employé supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Employé introuvable.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.employeeService.remove(companyId, id);
    return {
      success: true,
      message: 'Employé supprimé avec succès',
    };
  }

  @Get(':id/face-enrollment')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir l\'état d\'enregistrement facial d\'un employé' })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé' })
  async getFaceEnrollment(@Param('id') id: string) {
    const status = await this.employeeService.getFaceEnrollment(id);
    return {
      success: true,
      data: status,
    };
  }

  @Post(':id/face-enrollment')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Enregistrer les descripteurs faciaux d\'un employé' })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé' })
  async enrollFace(
    @Param('id') id: string,
    @Body() body: { descriptors: number[][] },
  ) {
    await this.employeeService.enrollFace(id, body.descriptors || []);
    return {
      success: true,
      message: 'Données faciales enregistrées avec succès',
    };
  }

  @Delete(':id/face-enrollment')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer les données faciales d\'un employé' })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé' })
  async deleteFaceEnrollment(@Param('id') id: string) {
    await this.employeeService.deleteFaceEnrollment(id);
    return {
      success: true,
      message: 'Données faciales supprimées avec succès',
    };
  }

  @Post(':id/generate-pin')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Générer automatiquement un nouveau code PIN à 4 chiffres pour l\'employé' })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé' })
  async generatePin(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const employee = await this.employeeService.generatePin(companyId, id);
    return {
      success: true,
      message: 'Code PIN généré avec succès',
      data: employee,
    };
  }

  @Get(':id/documents/work-certificate')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Générer le certificat de travail au format imprimable' })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé' })
  async getWorkCertificate(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const employee = await this.employeeService.findOne(companyId, id);
    const today = escapeHtml(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
    const hireDate = escapeHtml(new Date(employee.hireDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
    const firstName = escapeHtml(employee.firstName);
    const lastName = escapeHtml(employee.lastName);
    const contractType = escapeHtml(employee.contractType.toUpperCase());
    const departmentName = escapeHtml(employee.department?.name || 'Collaborateur');

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

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  }

  @Get(':id/documents/solde-de-tout-compte')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Générer le reçu de solde de tout compte au format imprimable' })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé' })
  async getSoldeDeToutCompte(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const employee = await this.employeeService.findOne(companyId, id);
    const today = escapeHtml(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
    const firstName = escapeHtml(employee.firstName);
    const lastName = escapeHtml(employee.lastName);
    const departmentName = escapeHtml(employee.department?.name || '—');
    const hireDateFormatted = escapeHtml(new Date(employee.hireDate).toLocaleDateString('fr-FR'));
    
    // Fetch remaining leave balance for calculation
    const leaveBalance = await this.prisma.leaveBalance.findFirst({
      where: { employeeId: id },
      select: { remaining: true },
    });
    
    const remainingDays = Number(leaveBalance?.remaining || 0);
    const baseSalaryNum = Number(employee.baseSalary) || 0;
    const transportAllowanceNum = Number(employee.transportAllowance) || 0;
    const hourlyRate = baseSalaryNum > 0 ? baseSalaryNum / 173.33 : 0;
    const leaveAllowance = Math.round(remainingDays * 8 * hourlyRate); // 8 hours per day of leave
    
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

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  }
}



