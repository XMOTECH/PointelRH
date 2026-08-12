import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leaves (Manager)')
@ApiBearerAuth('keycloak-token')
@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister toutes les demandes de congés', description: 'Récupère toutes les demandes de congés des employés de l\'entreprise.' })
  @ApiResponse({ status: 200, description: 'Liste des demandes de congés récupérée.' })
  async findAllRequests(@CurrentUser('companyId') companyId: string) {
    const requests = await this.leaveService.findAllRequests(companyId);
    return {
      success: true,
      data: requests,
    };
  }

  @Patch(':id/status')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une demande de congé', description: 'Approuve ou rejette une demande de congé.' })
  @ApiParam({ name: 'id', description: 'UUID de la demande' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès.' })
  async updateStatus(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    const request = await this.leaveService.updateStatus(companyId, id, dto, userId);
    return {
      success: true,
      data: request,
    };
  }
}
