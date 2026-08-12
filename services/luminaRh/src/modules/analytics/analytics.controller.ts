import { Controller, Get } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('keycloak-token')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Obtenir les statistiques du tableau de bord',
    description: 'Consolide et retourne les indicateurs clés principaux de l\'entreprise (ex: taux de présence, retards, demandes de congés actives).',
  })
  @ApiResponse({ status: 200, description: 'Indicateurs clés du tableau de bord récupérés avec succès.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' })
  async getDashboard(@CurrentUser('companyId') companyId: string) {
    const stats = await this.analyticsService.getDashboardStats(companyId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('department-stats')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Obtenir les statistiques par département',
    description: 'Retourne la répartition des effectifs et indicateurs de performance agrégés par département.',
  })
  @ApiResponse({ status: 200, description: 'Statistiques par département récupérées avec succès.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' })
  async getDepartments(@CurrentUser('companyId') companyId: string) {
    const stats = await this.analyticsService.getDepartmentStats(companyId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('presence')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Obtenir la tendance historique des présences',
    description: 'Retourne l\'évolution du taux de présence quotidien sur les 30 derniers jours.',
  })
  @ApiResponse({ status: 200, description: 'Historique de tendance de présence récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' })
  async getPresenceTrend(@CurrentUser('companyId') companyId: string) {
    const stats = await this.analyticsService.getPresenceTrend(companyId);
    return {
      success: true,
      data: stats,
    };
  }
}

