import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShiftTemplateService } from '../services/shift-template.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '../dto/shift-template.dto';

@ApiTags('Shift Templates')
@ApiBearerAuth('keycloak-token')
@Controller('shift-templates')
export class ShiftTemplateController {
  constructor(private readonly templateService: ShiftTemplateService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer un modèle de shift réutilisable' })
  @ApiResponse({ status: 201, description: 'Modèle créé avec succès.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateShiftTemplateDto,
  ) {
    const data = await this.templateService.create(companyId, dto);
    return { success: true, data };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin', 'realm:employee'] })
  @ApiOperation({ summary: 'Lister les modèles de shifts de l\'entreprise' })
  @ApiQuery({ name: 'department_id', required: false })
  @ApiResponse({ status: 200, description: 'Modèles récupérés.' })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('department_id') departmentId?: string,
  ) {
    const data = await this.templateService.findAll(companyId, departmentId);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Modifier un modèle de shift' })
  @ApiParam({ name: 'id', description: 'ID du modèle' })
  @ApiResponse({ status: 200, description: 'Modèle mis à jour.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateShiftTemplateDto,
  ) {
    const data = await this.templateService.update(companyId, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Désactiver un modèle de shift' })
  @ApiParam({ name: 'id', description: 'ID du modèle' })
  @ApiResponse({ status: 200, description: 'Modèle désactivé.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.templateService.remove(companyId, id);
    return { success: true, message: 'Modèle désactivé.' };
  }
}
