import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { CurrentUser, CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { OffboardingSessionService } from '../services/offboarding-session.service';
import { CreateOffboardingSessionDto } from '../dto/create-offboarding-session.dto';
import { UpdateOffboardingTaskDto } from '../dto/update-offboarding-task.dto';
import { SaveExitInterviewDto } from '../dto/save-exit-interview.dto';

@ApiTags('Offboarding - Sessions')
@ApiBearerAuth('keycloak-token')
@Controller('offboarding/sessions')
export class OffboardingSessionController {
  constructor(private readonly sessionService: OffboardingSessionService) {}

  @Get('stats')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir les indicateurs clés (KPIs) de l\'offboarding' })
  async getStats(@CurrentUser('companyId') companyId: string) {
    const stats = await this.sessionService.getStats(companyId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister toutes les sessions d\'offboarding de l\'entreprise' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'departureReason', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('departureReason') departureReason?: string,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
  ) {
    const sessions = await this.sessionService.findAll(companyId, {
      status,
      departureReason,
      departmentId,
      search,
    });
    return {
      success: true,
      data: sessions,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir la vue 360° d\'une session d\'offboarding' })
  async findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    const session = await this.sessionService.findOne(companyId, id);
    return {
      success: true,
      data: session,
    };
  }

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Initier une nouvelle procédure d\'offboarding' })
  async create(
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: CreateOffboardingSessionDto,
  ) {
    const session = await this.sessionService.createSession(
      user.companyId,
      dto,
      user.id,
      user.email,
    );
    return {
      success: true,
      message: 'Procédure d\'offboarding initiée avec succès',
      data: session,
    };
  }

  @Patch('tasks/:taskId')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une tâche de la checklist' })
  async updateTask(
    @CurrentUser() user: CurrentUserDto,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateOffboardingTaskDto,
  ) {
    const task = await this.sessionService.updateTask(
      user.companyId,
      taskId,
      dto,
      user.id,
      user.email,
    );
    return {
      success: true,
      message: 'Tâche mise à jour',
      data: task,
    };
  }

  @Post(':id/exit-interview')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Enregistrer le compte-rendu de l\'entretien de sortie' })
  async saveExitInterview(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') sessionId: string,
    @Body() dto: SaveExitInterviewDto,
  ) {
    const session = await this.sessionService.saveExitInterview(
      user.companyId,
      sessionId,
      dto,
      user.id,
      user.email,
    );
    return {
      success: true,
      message: 'Entretien de sortie enregistré avec succès',
      data: session,
    };
  }

  @Post(':id/handover')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Enregistrer les notes de passation de service' })
  async saveHandover(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') sessionId: string,
    @Body('notes') notes: string,
  ) {
    const session = await this.sessionService.saveHandoverNotes(
      user.companyId,
      sessionId,
      notes,
      user.id,
      user.email,
    );
    return {
      success: true,
      message: 'Notes de passation enregistrées',
      data: session,
    };
  }

  @Post(':id/transition')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Déclencher une transition dans la machine à états de l\'offboarding' })
  async transition(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') sessionId: string,
    @Body() body: { event: any },
  ) {
    const session = await this.sessionService.transitionStatus(
      user.companyId,
      sessionId,
      body.event,
      user.id,
      user.email,
    );
    return {
      success: true,
      message: 'Statut mis à jour avec succès',
      data: session,
    };
  }
}
