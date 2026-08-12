import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Locations')
@ApiBearerAuth('keycloak-token')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Créer un nouveau site de pointage',
    description: 'Crée un point géographique avec un rayon de géolocalisation pour le pointage mobile/kiosque.',
  })
  @ApiResponse({ status: 201, description: 'Site créé avec succès.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, super_admin.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateLocationDto,
  ) {
    const site = await this.locationService.create(companyId, dto);
    return {
      success: true,
      message: 'Site géographique créé avec succès',
      data: site,
    };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lister les sites de pointage',
    description: 'Récupère la liste de tous les sites géographiques de l\'entreprise.',
  })
  @ApiResponse({ status: 200, description: 'Liste des sites récupérée.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  async findAll(@CurrentUser('companyId') companyId: string) {
    const sites = await this.locationService.findAll(companyId);
    return {
      success: true,
      data: sites,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Détails d\'un site de pointage',
    description: 'Récupère les détails d\'un site géographique spécifique.',
  })
  @ApiParam({ name: 'id', description: 'UUID du site' })
  @ApiResponse({ status: 200, description: 'Site trouvé.' })
  @ApiResponse({ status: 404, description: 'Site introuvable.' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const site = await this.locationService.findOne(companyId, id);
    return {
      success: true,
      data: site,
    };
  }

  @Put(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Mettre à jour un site de pointage',
    description: 'Modifie les données d\'un site géographique.',
  })
  @ApiParam({ name: 'id', description: 'UUID du site' })
  @ApiResponse({ status: 200, description: 'Site mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Site introuvable.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    const site = await this.locationService.update(companyId, id, dto);
    return {
      success: true,
      message: 'Site géographique mis à jour avec succès',
      data: site,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Supprimer un site de pointage',
    description: 'Supprime un site géographique de la base de données.',
  })
  @ApiParam({ name: 'id', description: 'UUID du site' })
  @ApiResponse({ status: 200, description: 'Site supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Site introuvable.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.locationService.remove(companyId, id);
    return {
      success: true,
      message: 'Site géographique supprimé avec succès',
    };
  }

  @Get(':id/qr')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Régénérer le jeton QR d\'un site',
    description: 'Régénère le token de sécurité du QR Code pour invalider l\'ancien.',
  })
  @ApiParam({ name: 'id', description: 'UUID du site' })
  @ApiResponse({ status: 200, description: 'QR Token régénéré avec succès.' })
  async generateQr(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const result = await this.locationService.generateQr(companyId, id);
    return {
      success: true,
      data: result,
    };
  }
}
