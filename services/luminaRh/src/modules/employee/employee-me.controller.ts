import { Controller, Get, NotFoundException } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';

@ApiTags('Employee (Self)')
@ApiBearerAuth('keycloak-token')
@Controller('employee')
export class EmployeeMeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('me')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Obtenir mon propre profil',
    description: 'Récupère les détails complets du profil de l\'employé connecté.',
  })
  @ApiResponse({ status: 200, description: 'Détails du profil récupérés.' })
  @ApiResponse({ status: 404, description: 'Aucun profil employé associé.' })
  async getMe(@CurrentUser() user: CurrentUserDto) {
    if (!user.employeeId) {
      throw new NotFoundException('Aucun profil employé associé à cet utilisateur.');
    }
    const employee = await this.employeeService.findOne(user.companyId, user.employeeId);
    return {
      success: true,
      data: employee,
    };
  }
}
