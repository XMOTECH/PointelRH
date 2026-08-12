import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';

@ApiTags('Leaves (Employee)')
@ApiBearerAuth('keycloak-token')
@Controller('employee')
export class EmployeeLeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('my-leaves')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister mes demandes de congés', description: 'Récupère toutes les demandes de congés soumises par l\'employé connecté.' })
  @ApiResponse({ status: 200, description: 'Demandes récupérées.' })
  async findMyLeaves(@CurrentUser() user: CurrentUserDto) {
    if (!user.employeeId) {
      return { success: true, data: [] };
    }
    const leaves = await this.leaveService.findMyLeaves(user.employeeId);
    return {
      success: true,
      data: leaves,
    };
  }

  @Get('my-balance')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir mes soldes de congés', description: 'Récupère les soldes de congés de l\'employé connecté pour une année donnée.' })
  @ApiQuery({ name: 'year', required: false, description: 'Année du solde (par défaut 2026)' })
  @ApiResponse({ status: 200, description: 'Soldes récupérés.' })
  async findMyBalance(
    @CurrentUser() user: CurrentUserDto,
    @Query('year') year?: string,
  ) {
    if (!user.employeeId) {
      return { success: true, data: [] };
    }
    const targetYear = year ? parseInt(year, 10) : 2026;
    const balance = await this.leaveService.findMyBalance(user.employeeId, targetYear);
    return {
      success: true,
      data: balance,
    };
  }

  @Post('my-leaves')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Soumettre une demande de congé', description: 'Crée une demande de congé en attente de validation.' })
  @ApiResponse({ status: 201, description: 'Demande soumise.' })
  async createMyLeave(
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const request = await this.leaveService.createMyLeave(user.employeeId, user.companyId, dto);
    return {
      success: true,
      data: request,
    };
  }

  @Delete('my-leaves/:id')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Annuler une demande de congé', description: 'Annule et supprime une demande de congé encore en attente.' })
  @ApiParam({ name: 'id', description: 'UUID de la demande' })
  @ApiResponse({ status: 200, description: 'Demande annulée.' })
  async cancelMyLeave(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
  ) {
    if (!user.employeeId) {
      throw new Error('Aucun profil employé associé à cette session');
    }
    const result = await this.leaveService.cancelMyLeave(user.employeeId, id);
    return result;
  }
}
