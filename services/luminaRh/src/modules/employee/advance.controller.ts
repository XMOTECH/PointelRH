import { Controller, Get, Post, Patch, Body, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdvanceService } from './advance.service';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';

@ApiBearerAuth('keycloak-token')
@Controller()
export class AdvanceController {
  constructor(private readonly advanceService: AdvanceService) {}

  // ==========================================
  // EMPLOYEE SPACE (Self-Service)
  // ==========================================

  @ApiTags('Employee (Self)')
  @Post('employee/my-advances')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Demander un acompte ou prêt social',
    description: 'Permet au collaborateur de soumettre de manière confidentielle une demande d\'aide financière.',
  })
  async createMyAdvance(
    @CurrentUser() user: CurrentUserDto,
    @Body() body: { amount: number; type: string; reason?: string },
  ) {
    if (!user.employeeId) {
      throw new NotFoundException('Profil employé introuvable');
    }
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    const request = await this.advanceService.create(
      user.employeeId,
      body.amount,
      body.type,
      body.reason,
    );

    return {
      success: true,
      message: 'Demande soumise avec succès',
      data: request,
    };
  }

  @ApiTags('Employee (Self)')
  @Get('employee/my-advances')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Consulter mes demandes d\'acomptes/prêts',
    description: 'Récupère la liste de toutes les demandes de prêts ou acomptes effectuées par le salarié.',
  })
  async getMyAdvances(@CurrentUser() user: CurrentUserDto) {
    if (!user.employeeId) {
      throw new NotFoundException('Profil employé introuvable');
    }

    const requests = await this.advanceService.findAllForEmployee(user.employeeId);
    return {
      success: true,
      data: requests,
    };
  }

  // ==========================================
  // ADMINISTRATIVE SPACE (HR / Admin)
  // ==========================================

  @ApiTags('Employees')
  @Get('employees/advances')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lister toutes les demandes d\'acomptes/prêts de l\'entreprise',
    description: 'Récupère la liste de toutes les requêtes sociales en attente ou traitées de l\'organisation.',
  })
  async getAllAdvances(@CurrentUser('companyId') companyId: string) {
    const requests = await this.advanceService.findAll(companyId);
    return {
      success: true,
      data: requests,
    };
  }

  @ApiTags('Employees')
  @Patch('employees/advances/:id/status')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Valider ou rejeter une demande de prêt social',
    description: 'Permet au RH d\'accepter (approved) ou de refuser (rejected) la demande de financement.',
  })
  async updateAdvanceStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const updated = await this.advanceService.updateStatus(id, body.status);
    return {
      success: true,
      message: `Demande de prêt social mise à jour : ${body.status}`,
      data: updated,
    };
  }
}
