import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { MissionService } from './mission.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Missions (Manager)')
@ApiBearerAuth('keycloak-token')
@Controller('missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister toutes les missions', description: 'Récupère toutes les missions géographiques de l\'entreprise.' })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filtrer par département' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiResponse({ status: 200, description: 'Liste des missions récupérée.' })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('department_id') departmentId?: string,
    @Query('status') status?: string,
  ) {
    const missions = await this.missionService.findAll(companyId, { departmentId, status });
    return {
      success: true,
      data: missions,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Détails d\'une mission', description: 'Récupère les informations détaillées d\'une mission spécifique.' })
  @ApiParam({ name: 'id', description: 'UUID de la mission' })
  @ApiResponse({ status: 200, description: 'Détails de la mission récupérés.' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const mission = await this.missionService.findOne(companyId, id);
    return {
      success: true,
      data: mission,
    };
  }

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer une mission', description: 'Crée une nouvelle mission géographique et y affecte optionnellement des employés.' })
  @ApiResponse({ status: 201, description: 'Mission créée avec succès.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateMissionDto,
  ) {
    const mission = await this.missionService.create(companyId, dto);
    return {
      success: true,
      data: mission,
    };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Modifier une mission', description: 'Met à jour les informations d\'une mission existante.' })
  @ApiParam({ name: 'id', description: 'UUID de la mission' })
  @ApiResponse({ status: 200, description: 'Mission mise à jour.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMissionDto,
  ) {
    const mission = await this.missionService.update(companyId, id, dto);
    return {
      success: true,
      data: mission,
    };
  }

  @Post(':id/assign')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Affecter des employés à une mission', description: 'Affecte un groupe d\'employés à la mission.' })
  @ApiParam({ name: 'id', description: 'UUID de la mission' })
  @ApiResponse({ status: 200, description: 'Employés affectés avec succès.' })
  async assignEmployees(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('employee_ids') employeeIds: string[],
    @Body('comment') comment?: string,
  ) {
    const result = await this.missionService.assignEmployees(companyId, id, employeeIds, comment);
    return result;
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer une mission', description: 'Supprime définitivement une mission.' })
  @ApiParam({ name: 'id', description: 'UUID de la mission' })
  @ApiResponse({ status: 200, description: 'Mission supprimée.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.missionService.remove(companyId, id);
    return {
      success: true,
      message: 'Mission supprimée avec succès',
    };
  }

  @Post(':id/documents')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Ajouter des pièces jointes à une mission', description: 'Ajoute des documents officiels ou fichiers à la mission.' })
  @ApiParam({ name: 'id', description: 'UUID de la mission' })
  @ApiResponse({ status: 201, description: 'Fichiers ajoutés.' })
  async uploadDocuments(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('files') files: any[],
  ) {
    const docs = await this.missionService.uploadDocuments(companyId, id, files);
    return {
      success: true,
      data: docs,
    };
  }

  @Delete(':missionId/documents/:docId')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer un document de mission', description: 'Retire un document lié à la mission.' })
  @ApiParam({ name: 'missionId', description: 'UUID de la mission' })
  @ApiParam({ name: 'docId', description: 'UUID du document' })
  @ApiResponse({ status: 200, description: 'Document supprimé.' })
  async deleteDocument(
    @CurrentUser('companyId') companyId: string,
    @Param('missionId') missionId: string,
    @Param('docId') docId: string,
  ) {
    await this.missionService.deleteDocument(companyId, missionId, docId);
    return {
      success: true,
      message: 'Document supprimé avec succès',
    };
  }
}
