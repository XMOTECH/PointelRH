import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payroll')
@ApiBearerAuth('keycloak-token')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('pre-payroll')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Consulter l\'état de pré-paie mensuel',
    description: 'Calcule et consolide toutes les variables de paie du mois pour les employés actifs (heures sup, transport, acomptes).',
  })
  @ApiQuery({ name: 'monthYear', required: false, description: 'Format MM-YYYY (ex: 07-2026). Par défaut le mois en cours.' })
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
  @ApiOperation({
    summary: 'Exporter les variables de pré-paie en CSV',
    description: 'Génère et télécharge le fichier CSV consolidé des variables de paie prêt à être importé.',
  })
  @ApiQuery({ name: 'monthYear', required: false, description: 'Format MM-YYYY (ex: 07-2026).' })
  async exportCsv(
    @CurrentUser('companyId') companyId: string,
    @Query('monthYear') monthYear: string,
    @Res() res: Response,
  ) {
    const csvContent = await this.payrollService.exportPrePayrollToCsv(companyId, monthYear);
    
    const filename = `pre-payroll-${monthYear || new Date().toISOString().slice(0, 7)}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csvContent);
  }
}
