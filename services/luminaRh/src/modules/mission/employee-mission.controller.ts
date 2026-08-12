import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MissionService } from './mission.service';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';

@ApiTags('Missions (Employee)')
@ApiBearerAuth('keycloak-token')
@Controller('employee')
export class EmployeeMissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get('my-missions')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister mes missions assignées', description: 'Récupère toutes les missions affectées à l\'employé connecté.' })
  @ApiResponse({ status: 200, description: 'Missions récupérées.' })
  async findMyMissions(@CurrentUser() user: CurrentUserDto) {
    if (!user.employeeId) {
      return { success: true, data: [] };
    }
    const missions = await this.missionService.findMyMissions(user.employeeId);
    return {
      success: true,
      data: missions,
    };
  }

  @Get('my-missions/:id')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Détails d\'une de mes missions', description: 'Récupère les informations complètes d\'une mission de l\'employé, y compris ses tâches et ses collègues.' })
  @ApiParam({ name: 'id', description: 'UUID de la mission' })
  @ApiResponse({ status: 200, description: 'Détails de la mission récupérés.' })
  async findMyMissionDetail(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const detail = await this.missionService.findMyMissionDetail(user.employeeId, user.companyId, id);
    return {
      success: true,
      data: detail,
    };
  }
}
