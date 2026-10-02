import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { CurrentUser, CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { PerformanceObjectiveService } from '../services/performance-objective.service';
import { CreateObjectiveDto, UpdateObjectiveDto } from '../dto/create-objective.dto';

@ApiTags('Performance - Objectifs & OKRs')
@ApiBearerAuth('keycloak-token')
@Controller('performance/objectives')
export class PerformanceObjectiveController {
  constructor(private readonly objectiveService: PerformanceObjectiveService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Assigner un nouvel objectif (individuel, d\'équipe ou stratégique)' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: CreateObjectiveDto,
  ) {
    const data = await this.objectiveService.create(companyId, user, dto);
    return { success: true, data };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les objectifs fixés' })
  @ApiQuery({ name: 'employeeId', required: false })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser() user: CurrentUserDto,
    @Query('employeeId') employeeId?: string,
  ) {
    const data = await this.objectiveService.findAll(companyId, user, employeeId);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour la progression ou le statut d\'un objectif' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: UpdateObjectiveDto,
  ) {
    const data = await this.objectiveService.update(companyId, id, user, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer un objectif' })
  async delete(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const data = await this.objectiveService.delete(companyId, id);
    return { success: true, data };
  }
}
