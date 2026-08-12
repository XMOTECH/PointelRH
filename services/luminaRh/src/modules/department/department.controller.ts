import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Departments')
@ApiBearerAuth('keycloak-token')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Créer un département' })
  @ApiResponse({ status: 201, description: 'Département créé avec succès.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    const department = await this.departmentService.create(companyId, dto);
    return {
      success: true,
      message: 'Département créé avec succès',
      data: department,
    };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les départements' })
  @ApiResponse({ status: 200, description: 'Liste des départements récupérée avec succès.' })
  async findAll(@CurrentUser('companyId') companyId: string) {
    const departments = await this.departmentService.findAll(companyId);
    return {
      success: true,
      data: departments,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir un département' })
  @ApiParam({ name: 'id', description: 'UUID du département' })
  @ApiResponse({ status: 200, description: 'Département trouvé.' })
  @ApiResponse({ status: 404, description: 'Département introuvable.' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const department = await this.departmentService.findOne(companyId, id);
    return {
      success: true,
      data: department,
    };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Mettre à jour un département' })
  @ApiParam({ name: 'id', description: 'UUID du département' })
  @ApiResponse({ status: 200, description: 'Département mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Département introuvable.' })
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const department = await this.departmentService.update(companyId, id, dto);
    return {
      success: true,
      message: 'Département mis à jour avec succès',
      data: department,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Supprimer un département' })
  @ApiParam({ name: 'id', description: 'UUID du département' })
  @ApiResponse({ status: 200, description: 'Département supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Département introuvable.' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.departmentService.remove(companyId, id);
    return {
      success: true,
      message: 'Département supprimé avec succès',
    };
  }
}
