import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OnboardingTemplateService } from '../services/onboarding-template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Onboarding Templates')
@ApiBearerAuth('keycloak-token')
@Controller('onboarding/templates')
export class OnboardingTemplateController {
  constructor(private readonly templateService: OnboardingTemplateService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Créer un modèle de parcours d\'onboarding',
    description: 'Définit un nouveau modèle avec sa liste de tâches configurables par métier (Usine 3x8, Bureau, etc.).',
  })
  @ApiResponse({ status: 201, description: 'Modèle créé avec succès.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    const template = await this.templateService.create(companyId, dto);
    return {
      success: true,
      message: 'Modèle d\'onboarding créé avec succès',
      data: template,
    };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lister les modèles d\'onboarding de l\'entreprise',
    description: 'Renvoie tous les modèles actifs. Initialise automatiquement les modèles industriels par défaut si la liste est vide.',
  })
  async findAll(@CurrentUser('companyId') companyId: string) {
    const templates = await this.templateService.findAll(companyId);
    return {
      success: true,
      data: templates,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir les détails d\'un modèle d\'onboarding' })
  @ApiParam({ name: 'id', description: 'UUID du modèle' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const template = await this.templateService.findOne(companyId, id);
    return {
      success: true,
      data: template,
    };
  }
}
