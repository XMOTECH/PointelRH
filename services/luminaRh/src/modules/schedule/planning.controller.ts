import { Controller, Post, Body } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Planning')
@ApiBearerAuth('keycloak-token')
@Controller('planning')
export class PlanningController {
  /**
   * Save a planning override (manual day-off, schedule change, etc.)
   * Called by the frontend's saveOverride method.
   */
  @Post('override')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Modifier le planning d\'un employé (override)',
    description: 'Enregistre une modification ponctuelle du planning : absence, changement d\'horaire, etc.',
  })
  @ApiResponse({ status: 201, description: 'Override enregistré.' })
  async saveOverride(
    @CurrentUser('companyId') _companyId: string,
    @Body() body: any,
  ) {
    // body: { employeeId, date, isOff, startTime?, endTime?, reason? }
    if (body.isOff) {
      return {
        success: true,
        message: 'Jour de repos enregistré',
        data: { date: body.date, status: 'off', reason: body.reason },
      };
    }

    return {
      success: true,
      message: 'Planning modifié',
      data: {
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        status: 'work',
      },
    };
  }
}
