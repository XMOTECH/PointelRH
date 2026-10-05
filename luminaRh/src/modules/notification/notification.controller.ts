import { Controller, Get, Post, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('keycloak-token')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les notifications de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Liste des notifications récupérée avec succès.' })
  async findAll(@CurrentUser('id') userId: string) {
    const notifications = await this.notificationService.findAllForUser(userId);
    return {
      success: true,
      data: notifications,
    };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications marquées comme lues.' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return {
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
    };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiParam({ name: 'id', description: 'UUID de la notification' })
  @ApiResponse({ status: 200, description: 'Notification marquée comme lue.' })
  @ApiResponse({ status: 404, description: 'Notification introuvable.' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const notification = await this.notificationService.markAsRead(userId, id);
    return {
      success: true,
      data: notification,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer une notification' })
  @ApiParam({ name: 'id', description: 'UUID de la notification' })
  @ApiResponse({ status: 200, description: 'Notification supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Notification introuvable.' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.notificationService.remove(userId, id);
    return {
      success: true,
      message: 'Notification supprimée avec succès',
    };
  }
}
