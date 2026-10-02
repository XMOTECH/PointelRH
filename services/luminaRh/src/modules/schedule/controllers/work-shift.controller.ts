import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WorkShiftService } from '../services/work-shift.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateShiftDto, UpdateShiftDto, MoveShiftDto } from '../dto';

@ApiTags('Shifts')
@ApiBearerAuth('keycloak-token')
@Controller('shifts')
export class WorkShiftController {
  constructor(private readonly workShiftService: WorkShiftService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Créer un nouveau shift',
    description: 'Crée un créneau de travail planifié (assigné ou ouvert) avec évaluation de conformité en temps réel.',
  })
  @ApiResponse({ status: 201, description: 'Shift créé avec succès.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateShiftDto,
  ) {
    const result = await this.workShiftService.create(companyId, dto, userId);
    return {
      success: true,
      data: result.shift,
      violations: result.violations,
    };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Modifier un shift existant',
    description: 'Met à jour les horaires, la pause, le collaborateur ou les notes d\'un shift.',
  })
  @ApiParam({ name: 'id', description: 'ID du shift' })
  @ApiResponse({ status: 200, description: 'Shift modifié.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    const result = await this.workShiftService.update(companyId, id, dto, userId);
    return {
      success: true,
      data: result.shift,
      violations: result.violations,
    };
  }

  @Post(':id/move')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Déplacer rapidement un shift (Glisser-Déposer)',
    description: 'Permet de réassigner un shift à un autre collaborateur ou à une autre date instantanément.',
  })
  @ApiParam({ name: 'id', description: 'ID du shift' })
  @ApiResponse({ status: 200, description: 'Shift déplacé.' })
  async move(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: MoveShiftDto,
  ) {
    const result = await this.workShiftService.move(companyId, id, dto, userId);
    return {
      success: true,
      data: result.shift,
      violations: result.violations,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer un shift' })
  @ApiParam({ name: 'id', description: 'ID du shift' })
  @ApiResponse({ status: 200, description: 'Shift supprimé.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.workShiftService.remove(companyId, id);
  }
}
