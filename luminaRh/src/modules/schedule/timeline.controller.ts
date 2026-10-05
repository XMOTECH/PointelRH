import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Timeline / Planning')
@ApiBearerAuth('keycloak-token')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('team')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Récupérer le planning équipe (timeline)',
    description: 'Retourne le planning hebdomadaire de tous les employés actifs avec leurs shifts, congés et missions.',
  })
  @ApiQuery({ name: 'start', required: true, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', required: true, description: 'Date de fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filtrer par département' })
  @ApiResponse({ status: 200, description: 'Timeline récupérée avec succès.' })
  async getTeamTimeline(
    @CurrentUser('companyId') companyId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('department_id') departmentId?: string,
  ) {
    const timeline = await this.timelineService.getTeamTimeline(companyId, start, end, departmentId);
    return {
      success: true,
      data: timeline,
    };
  }

  @Get('occupancy')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Taux d\'occupation',
    description: 'Retourne le taux d\'occupation pour une date donnée.',
  })
  @ApiQuery({ name: 'date', required: false, description: 'Date (YYYY-MM-DD), défaut: aujourd\'hui' })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filtrer par département' })
  @ApiResponse({ status: 200, description: 'Taux d\'occupation calculé.' })
  async getOccupancy(
    @CurrentUser('companyId') companyId: string,
    @Query('date') date?: string,
    @Query('department_id') departmentId?: string,
  ) {
    // Simplified occupancy calculation
    const targetDate = date || new Date().toISOString().split('T')[0];
    const timeline = await this.timelineService.getTeamTimeline(
      companyId, targetDate, targetDate, departmentId,
    );

    const total = timeline.length;
    const working = timeline.filter(emp =>
      emp.shifts.some((s: any) => s.date === targetDate && s.status === 'work'),
    ).length;
    const onLeave = timeline.filter(emp =>
      emp.shifts.some((s: any) => s.date === targetDate && s.status === 'leave'),
    ).length;

    return {
      success: true,
      data: {
        date: targetDate,
        total,
        working,
        onLeave,
        absent: total - working - onLeave,
        occupancyRate: total > 0 ? Math.round((working / total) * 100) : 0,
      },
    };
  }

}

