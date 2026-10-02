import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PerformanceCampaignService } from '../services/performance-campaign.service';
import { CreatePerformanceCampaignDto } from '../dto/create-performance-campaign.dto';

@ApiTags('Performance - Campagnes d\'Évaluation')
@ApiBearerAuth('keycloak-token')
@Controller('performance/campaigns')
export class PerformanceCampaignController {
  constructor(private readonly campaignService: PerformanceCampaignService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lancer une nouvelle campagne d\'évaluation pour l\'entreprise' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreatePerformanceCampaignDto,
  ) {
    const data = await this.campaignService.create(companyId, dto);
    return { success: true, data };
  }

  @Get('stats')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir les indicateurs de performance globaux (KPIs RH)' })
  async getGlobalStats(@CurrentUser('companyId') companyId: string) {
    const data = await this.campaignService.getGlobalStats(companyId);
    return { success: true, data };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister toutes les campagnes d\'évaluation de l\'entreprise' })
  async findAll(@CurrentUser('companyId') companyId: string) {
    const data = await this.campaignService.findAll(companyId);
    return { success: true, data };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Consulter le détail d\'une campagne et le suivi des participants' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const data = await this.campaignService.findOne(companyId, id);
    return { success: true, data };
  }

  @Post(':id/close')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Clôturer officiellement une campagne d\'évaluation' })
  async close(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const data = await this.campaignService.closeCampaign(companyId, id);
    return { success: true, data };
  }
}
