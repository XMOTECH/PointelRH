import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OffboardingTemplateService } from '../services/offboarding-template.service';
import { CreateOffboardingTemplateDto } from '../dto/create-offboarding-template.dto';

@ApiTags('Offboarding - Modèles & Checklists')
@ApiBearerAuth('keycloak-token')
@Controller('offboarding/templates')
export class OffboardingTemplateController {
  constructor(private readonly templateService: OffboardingTemplateService) {}

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les modèles d\'offboarding de l\'entreprise' })
  @ApiResponse({ status: 200, description: 'Liste des modèles d\'offboarding.' })
  async findAll(@CurrentUser('companyId') companyId: string) {
    const templates = await this.templateService.findAll(companyId);
    return {
      success: true,
      data: templates,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir le détail d\'un modèle d\'offboarding' })
  async findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    const template = await this.templateService.findOne(companyId, id);
    return {
      success: true,
      data: template,
    };
  }

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer un nouveau modèle d\'offboarding personnalisé' })
  async create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateOffboardingTemplateDto) {
    const template = await this.templateService.create(companyId, dto);
    return {
      success: true,
      message: 'Modèle d\'offboarding créé avec succès',
      data: template,
    };
  }
}
