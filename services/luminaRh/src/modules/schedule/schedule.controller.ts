import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Schedules')
@ApiBearerAuth('keycloak-token')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer un horaire de travail' })
  @ApiResponse({ status: 201, description: 'Horaire créé avec succès.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    const schedule = await this.scheduleService.create(companyId, dto);
    return {
      success: true,
      message: 'Horaire créé avec succès',
      data: schedule,
    };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les horaires de travail' })
  @ApiResponse({ status: 200, description: 'Liste des horaires récupérée avec succès.' })
  async findAll(@CurrentUser('companyId') companyId: string) {
    const schedules = await this.scheduleService.findAll(companyId);
    return {
      success: true,
      data: schedules,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir un horaire' })
  @ApiParam({ name: 'id', description: 'UUID de l\'horaire' })
  @ApiResponse({ status: 200, description: 'Horaire trouvé.' })
  @ApiResponse({ status: 404, description: 'Horaire introuvable.' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const schedule = await this.scheduleService.findOne(companyId, id);
    return {
      success: true,
      data: schedule,
    };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour un horaire' })
  @ApiParam({ name: 'id', description: 'UUID de l\'horaire' })
  @ApiResponse({ status: 200, description: 'Horaire mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Horaire introuvable.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    const schedule = await this.scheduleService.update(companyId, id, dto);
    return {
      success: true,
      message: 'Horaire mis à jour avec succès',
      data: schedule,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer un horaire' })
  @ApiParam({ name: 'id', description: 'UUID de l\'horaire' })
  @ApiResponse({ status: 200, description: 'Horaire supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Horaire introuvable.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.scheduleService.remove(companyId, id);
    return {
      success: true,
      message: 'Horaire supprimé avec succès',
    };
  }
}
