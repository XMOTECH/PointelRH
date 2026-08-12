import { Controller, Get } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leave Types')
@ApiBearerAuth('keycloak-token')
@Controller('leave-types')
export class LeaveTypeController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les types de congés disponibles', description: 'Récupère tous les types de congés actifs configurés pour l\'entreprise.' })
  @ApiResponse({ status: 200, description: 'Liste des types de congés récupérée.' })
  async getLeaveTypes(@CurrentUser('companyId') companyId: string) {
    const types = await this.leaveService.getLeaveTypes(companyId);
    return {
      success: true,
      data: types,
    };
  }
}
