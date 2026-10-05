import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateMyTaskDto } from './dto/create-my-task.dto';
import { UpdateMyTaskDto } from './dto/update-my-task.dto';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks (Employee)')
@ApiBearerAuth('keycloak-token')
@Controller('employee')
export class EmployeeTaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('my-tasks')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister mes tâches personnelles', description: 'Récupère toutes les tâches assignées à l\'employé connecté.' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiResponse({ status: 200, description: 'Tâches récupérées.' })
  async findMyTasks(
    @CurrentUser() user: CurrentUserDto,
    @Query('status') status?: string,
  ) {
    if (!user.employeeId) {
      return { success: true, data: [] };
    }
    const tasks = await this.taskService.findMyTasks(user.employeeId, status);
    return {
      success: true,
      data: tasks,
    };
  }

  @Patch('my-tasks/:id/status')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une de mes tâches', description: 'Permet à l\'employé de changer l\'état (todo, in_progress, done) de sa tâche.' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour.' })
  async updateMyTaskStatus(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const task = await this.taskService.updateMyTaskStatus(user.employeeId, id, status);
    return {
      success: true,
      data: task,
    };
  }

  @Post('my-tasks/:id/timer')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Enregistrer du temps de travail sur une tâche', description: 'Ajoute des minutes passées au total réel de travail accompli sur cette tâche.' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche' })
  @ApiResponse({ status: 200, description: 'Temps enregistré.' })
  async logTime(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
    @Body('minutes') minutes: number,
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const result = await this.taskService.logTime(user.employeeId, id, minutes);
    return {
      success: true,
      data: result,
    };
  }

  @Post('my-missions/:missionId/tasks')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer une tâche personnelle sous une mission', description: 'Crée une sous-tâche liée à une mission spécifique à laquelle l\'employé collabore.' })
  @ApiParam({ name: 'missionId', description: 'UUID de la mission associée' })
  @ApiResponse({ status: 201, description: 'Tâche créée.' })
  async createMyTask(
    @CurrentUser() user: CurrentUserDto,
    @Param('missionId') missionId: string,
    @Body() dto: CreateMyTaskDto,
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const task = await this.taskService.createMyTask(user.employeeId, user.companyId, missionId, dto);
    return {
      success: true,
      data: task,
    };
  }

  @Patch('my-tasks/:id')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour les détails d\'une de mes tâches', description: 'Met à jour le titre, description, priorité ou estimation de temps de la tâche de l\'employé.' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche mise à jour.' })
  async updateMyTask(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
    @Body() dto: UpdateMyTaskDto,
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const task = await this.taskService.updateMyTask(user.employeeId, id, dto);
    return {
      success: true,
      data: task,
    };
  }

  @Post('my-tasks/:id/comments')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Commenter ma tâche', description: 'Ajoute un commentaire ou compte-rendu textuel sur la tâche.' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche' })
  @ApiResponse({ status: 201, description: 'Commentaire ajouté.' })
  async addMyComment(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('attachments') attachments?: any[],
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const comment = await this.taskService.addComment(id, user.employeeId, content, attachments);
    return {
      success: true,
      data: comment,
    };
  }
}
