import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { Roles } from 'nest-keycloak-connect';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { AddPayrollVariableDto } from './dto/add-payroll-variable.dto';

@ApiTags('Payroll Engine (Sénégal)')
@ApiBearerAuth('keycloak-token')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('run')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lancer ou recalculer le cycle de paie mensuel',
    description:
      'Génère automatiquement les bulletins de tous les collaborateurs actifs en appliquant les barèmes légaux sénégalais (IPRES, CSS, CFCE, IR et Quotient Familial).',
  })
  async generatePayrollRun(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GeneratePayrollDto,
  ) {
    const period = await this.payrollService.generatePayrollRun(
      companyId,
      dto.month,
      dto.year,
      userId,
    );
    return {
      success: true,
      message: `Cycle de paie ${dto.month}/${dto.year} calculé avec succès`,
      data: period,
    };
  }

  @Get('periods')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les périodes de paie de l\'entreprise' })
  async getPayrollPeriods(@CurrentUser('companyId') companyId: string) {
    const periods = await this.payrollService.getPayrollPeriods(companyId);
    return {
      success: true,
      data: periods,
    };
  }

  @Get('periods/:id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Détails d\'une période de paie avec tous les bulletins' })
  @ApiParam({ name: 'id', description: 'ID de la période de paie' })
  async getPayrollPeriod(
    @CurrentUser('companyId') companyId: string,
    @Param('id') periodId: string,
  ) {
    const period = await this.payrollService.getPayrollPeriod(companyId, periodId);
    return {
      success: true,
      data: period,
    };
  }

  @Post('periods/:id/validate')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Valider et verrouiller une période de paie' })
  async validatePeriod(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') periodId: string,
  ) {
    const updated = await this.payrollService.validatePeriod(companyId, periodId, userId);
    return {
      success: true,
      message: 'Période de paie validée et verrouillée avec succès',
      data: updated,
    };
  }

  @Post('periods/:id/mark-paid')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Marquer la période de paie et les bulletins comme payés' })
  async markPeriodAsPaid(
    @CurrentUser('companyId') companyId: string,
    @Param('id') periodId: string,
  ) {
    const updated = await this.payrollService.markPeriodAsPaid(companyId, periodId);
    return {
      success: true,
      message: 'Période de paie marquée comme payée',
      data: updated,
    };
  }

  @Get('periods/:id/export-bank')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Exporter le fichier d\'ordre de virement bancaire' })
  async exportBankTransfer(
    @CurrentUser('companyId') companyId: string,
    @Param('id') periodId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const csvContent = await this.payrollService.exportBankTransfer(companyId, periodId);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header(
      'Content-Disposition',
      `attachment; filename="virement-bancaire-${periodId}.csv"`,
    );
    return csvContent;
  }

  @Get('periods/:id/export-mobile-money')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Exporter le fichier de paiement Mobile Money (Wave / Orange Money)' })
  async exportMobileMoney(
    @CurrentUser('companyId') companyId: string,
    @Param('id') periodId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const csvContent = await this.payrollService.exportMobileMoney(companyId, periodId);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header(
      'Content-Disposition',
      `attachment; filename="virement-wave-om-${periodId}.csv"`,
    );
    return csvContent;
  }

  @Get('payslips/:id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin', 'realm:employee'] })
  @ApiOperation({ summary: 'Consulter un bulletin de paie détaillé avec toutes ses rubriques' })
  @ApiParam({ name: 'id', description: 'ID du bulletin de paie' })
  async getPayslip(
    @CurrentUser('companyId') companyId: string,
    @Param('id') payslipId: string,
  ) {
    const payslip = await this.payrollService.getPayslip(companyId, payslipId);
    return {
      success: true,
      data: payslip,
    };
  }

  @Post('variables')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Ajouter une prime ou retenue ponctuelle pour un employé' })
  async addVariable(
    @CurrentUser('companyId') companyId: string,
    @Body()
    body: {
      employeeId: string;
      month: number;
      year: number;
      dto: AddPayrollVariableDto;
    },
  ) {
    const variable = await this.payrollService.addVariable(
      companyId,
      body.employeeId,
      body.month,
      body.year,
      body.dto,
    );
    return {
      success: true,
      message: 'Variable de paie enregistrée avec succès',
      data: variable,
    };
  }

  // =========================================================================
  // RÉTRO-COMPATIBILITÉ (ANCIENNE PRÉ-PAIE)
  // =========================================================================

  @Get('pre-payroll')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Consulter l\'état de pré-paie mensuel (Rétro-compatibilité)' })
  @ApiQuery({ name: 'monthYear', required: false, description: 'Format MM-YYYY' })
  async getPrePayroll(
    @CurrentUser('companyId') companyId: string,
    @Query('monthYear') monthYear?: string,
  ) {
    const data = await this.payrollService.getPrePayroll(companyId, monthYear);
    return {
      success: true,
      data,
    };
  }

  @Get('pre-payroll/export')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Exporter les variables de pré-paie en CSV' })
  @ApiQuery({ name: 'monthYear', required: false, description: 'Format MM-YYYY' })
  async exportCsv(
    @CurrentUser('companyId') companyId: string,
    @Query('monthYear') monthYear: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const csvContent = await this.payrollService.exportPrePayrollToCsv(companyId, monthYear);
    const filename = `pre-payroll-${monthYear || new Date().toISOString().slice(0, 7)}.csv`;
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    return csvContent;
  }
}
