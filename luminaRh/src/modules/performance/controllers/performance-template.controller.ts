import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PerformanceTemplateService } from '../services/performance-template.service';
import { CreatePerformanceTemplateDto } from '../dto/create-performance-template.dto';

@ApiTags('Performance - Modèles & Formulaires')
@ApiBearerAuth('keycloak-token')
@Controller('performance/templates')
export class PerformanceTemplateController {
  constructor(private readonly templateService: PerformanceTemplateService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer un nouveau modèle d\'entretien d\'évaluation' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreatePerformanceTemplateDto,
  ) {
    const data = await this.templateService.create(companyId, dto);
    return { success: true, data };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister tous les modèles d\'entretien disponibles' })
  async findAll(@CurrentUser('companyId') companyId: string) {
    const data = await this.templateService.findAll(companyId);
    return { success: true, data };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Consulter un modèle d\'entretien spécifique' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const data = await this.templateService.findOne(companyId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour un modèle d\'entretien' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePerformanceTemplateDto>,
  ) {
    const data = await this.templateService.update(companyId, id, dto);
    return { success: true, data };
  }
}
