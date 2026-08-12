import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks (Manager)')
@ApiBearerAuth('keycloak-token')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister toutes les tâches', description: 'Récupère toutes les tâches de l\'entreprise avec possibilité de filtres.' })
  @ApiQuery({ name: 'department_id', required: false, description: 'ID du département' })
  @ApiQuery({ name: 'mission_id', required: false, description: 'ID de la mission' })
  @ApiQuery({ name: 'employee_id', required: false, description: 'ID de l\'employé assigné' })
  @ApiQuery({ name: 'status', required: false, description: 'Statut de la tâche' })
  @ApiResponse({ status: 200, description: 'Liste des tâches récupérée.' })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('department_id') departmentId?: string,
    @Query('mission_id') missionId?: string,
    @Query('employee_id') employeeId?: string,
    @Query('status') status?: string,
  ) {
    const tasks = await this.taskService.findAll(companyId, { departmentId, missionId, employeeId, status });
    return {
      success: true,
      data: tasks,
    };
  }

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer une tâche', description: 'Crée et assigne une nouvelle tâche à un employé.' })
  @ApiResponse({ status: 201, description: 'Tâche créée.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.taskService.create(companyId, userId, dto);
    return {
      success: true,
      data: task,
    };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour une tâche', description: 'Met à jour les données d\'une tâche existante.' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche mise à jour.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    const task = await this.taskService.update(companyId, id, dto);
    return {
      success: true,
      data: task,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer une tâche', description: 'Supprime une tâche définitivement.' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche supprimée.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.taskService.remove(companyId, id);
    return {
      success: true,
      message: 'Tâche supprimée avec succès',
    };
  }

  @Post(':id/comments')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Ajouter un commentaire', description: 'Ajoute un commentaire à la tâche avec pièces jointes éventuelles.' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche' })
  @ApiResponse({ status: 201, description: 'Commentaire ajouté.' })
  async addComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
    @Body('attachments') attachments?: any[],
  ) {
    const comment = await this.taskService.addComment(id, userId, content, attachments);
    return {
      success: true,
      data: comment,
    };
  }
}
