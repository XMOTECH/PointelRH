import { Controller, Get, Post, Body, Query, Param, HttpCode, HttpStatus, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Roles, Public } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PointageService } from './pointage.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { PunchDto } from './dto/punch.dto';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';

@ApiTags('Pointages')
@Controller('pointage')
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Public()
  @Post('punch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pointage universel intelligent (Smart Punch / Toggle)',
    description: 'Bascule automatiquement entre Entrée et Sortie selon l\'état de la session active de l\'employé, sans provoquer d\'erreur 409.',
  })
  @ApiQuery({ name: 'company_id', required: false, description: 'UUID de l\'entreprise' })
  @ApiResponse({ status: 200, description: 'Pointage enregistré avec succès (Entrée ou Sortie).' })
  async punch(
    @CurrentUser() user: CurrentUserDto,
    @Query('company_id') queryCompanyId: string,
    @Body() punchDto: PunchDto,
  ) {
    const explicitCompanyId = queryCompanyId || punchDto.companyId || punchDto.company_id || user?.companyId;
    const result = await this.pointageService.punch(punchDto, explicitCompanyId);
    return {
      success: true,
      ...result,
    };
  }

  @Public() // Allow kiosks and mobile apps to submit clock-ins without user login constraints
  @Post('clock-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enregistrer une entrée (Clock In)',
    description: 'Enregistre le pointage d\'arrivée d\'un employé via PIN, QR Code, Reconnaissance Faciale ou Web.',
  })
  @ApiQuery({ name: 'company_id', required: false, description: 'UUID de l\'entreprise (peut également être passé dans le payload)' })
  @ApiResponse({ status: 201, description: 'Pointage enregistré avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides ou pointage en dehors de la zone de géolocalisation autorisée.' })
  async clockIn(
    @CurrentUser() user: CurrentUserDto,
    @Query('company_id') queryCompanyId: string,
    @Body() clockInDto: ClockInDto,
  ) {
    const companyId = queryCompanyId || clockInDto.companyId || clockInDto.company_id || clockInDto.payload?.companyId || clockInDto.payload?.company_id || user?.companyId;
    const attendance = await this.pointageService.clockIn(companyId, clockInDto);
    return {
      success: true,
      message: 'Pointage enregistré avec succès',
      data: attendance,
    };
  }

  @Public()
  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enregistrer une sortie (Clock Out)',
    description: 'Enregistre le pointage de départ d\'un employé via kiosque (PIN/Face) ou utilisateur connecté.',
  })
  @ApiResponse({ status: 200, description: 'Pointage de sortie enregistré avec succès.' })
  @ApiResponse({ status: 400, description: 'Aucun pointage d\'arrivée actif trouvé pour aujourd\'hui ou coordonnées invalides.' })
  async clockOut(
    @CurrentUser() user: CurrentUserDto,
    @Body() clockOutDto: ClockOutDto,
  ) {
    const employeeId = clockOutDto?.employee_id || clockOutDto?.employeeId || user?.employeeId || user?.id;
    if (!employeeId) {
      throw new BadRequestException('ID employé manquant pour le pointage de sortie');
    }
    const attendance = await this.pointageService.clockOut(employeeId, clockOutDto);
    return {
      success: true,
      message: 'Pointage de sortie enregistré',
      data: attendance,
    };
  }

  @Get('attendances/my-today')
  @ApiBearerAuth('keycloak-token')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Obtenir mon statut de pointage du jour',
    description: 'Retourne le pointage d\'arrivée (et éventuellement de sortie) de l\'employé connecté pour la date du jour.',
  })
  @ApiResponse({ status: 200, description: 'Statut du pointage du jour récupéré.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  async getMyToday(
    @CurrentUser() user: CurrentUserDto,
    @Query('employee_id') queryEmployeeId?: string,
  ) {
    const targetId = queryEmployeeId || user?.employeeId || user?.id;
    if (!targetId) {
      return { success: true, data: null };
    }
    const attendance = await this.pointageService.getTodayStatus(targetId);
    return {
      success: true,
      data: attendance,
    };
  }

  @Get('attendances/today')
  @ApiBearerAuth('keycloak-token')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lister les pointages d\'aujourd\'hui',
    description: 'Récupère tous les pointages du jour pour l\'entreprise connectée, avec possibilité de filtres par département ou lieu géographique.',
  })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filtrer par UUID du département' })
  @ApiQuery({ name: 'location_id', required: false, description: 'Filtrer par UUID du lieu de travail' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrer par date spécifique (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Liste des pointages du jour récupérée.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' })
  async getToday(
    @CurrentUser('companyId') companyId: string,
    @Query('department_id') departmentId?: string,
    @Query('location_id') locationId?: string,
    @Query('date') date?: string,
  ) {
    const attendances = await this.pointageService.getHistory(companyId, {
      departmentId,
      locationId,
      date,
    });
    return {
      success: true,
      data: attendances,
    };
  }

  @Get('attendances/by-employees')
  @ApiBearerAuth('keycloak-token')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lister les pointages par IDs d\'employés',
    description: 'Récupère l\'historique des pointages pour une liste d\'employés spécifiés par leurs UUIDs séparés par des virgules.',
  })
  @ApiQuery({ name: 'employee_ids', required: true, description: 'UUIDs des employés séparés par des virgules' })
  @ApiResponse({ status: 200, description: 'Pointages récupérés avec succès.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  async getByEmployeeIds(
    @CurrentUser('companyId') companyId: string,
    @Query('employee_ids') employeeIdsStr: string,
  ) {
    if (!employeeIdsStr) {
      return { success: true, data: [] };
    }
    const employeeIds = employeeIdsStr.split(',').map(id => id.trim()).filter(Boolean);
    const attendances = await this.pointageService.getByEmployeeIds(companyId, employeeIds);
    return {
      success: true,
      data: attendances,
    };
  }

  @Get('live')
  @ApiBearerAuth('keycloak-token')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Flux en temps réel des pointages',
    description: 'Récupère un aperçu en direct des pointages de la journée (alias de la route de récupération historique du jour).',
  })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filtrer par UUID du département' })
  @ApiQuery({ name: 'location_id', required: false, description: 'Filtrer par UUID du lieu' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrer par date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Flux en direct récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit. Rôles requis: admin, manager, super_admin.' })
  async getLive(
    @CurrentUser('companyId') companyId: string,
    @Query('department_id') departmentId?: string,
    @Query('location_id') locationId?: string,
    @Query('date') date?: string,
  ) {
    return this.getToday(companyId, departmentId, locationId, date);
  }

  @Get('attendances/employee/:id')
  @ApiBearerAuth('keycloak-token')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Lister les pointages d\'un employé spécifique',
    description: 'Récupère l\'historique complet des pointages pour un employé donné de la même entreprise. Les employés simples ne peuvent consulter que leur propre historique.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'employé ciblé' })
  @ApiResponse({ status: 200, description: 'Historique des pointages de l\'employé récupéré.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée.' })
  @ApiResponse({ status: 403, description: 'Accès interdit.' })
  async getByEmployee(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
  ) {
    // Security check: simple employees can only view their own attendance
    if (user.role === 'employee' && user.employeeId !== id) {
      throw new ForbiddenException('Vous n\'avez pas l\'autorisation de consulter l\'historique de ce collaborateur.');
    }

    const attendances = await this.pointageService.getHistory(user.companyId, {
      employeeId: id,
    });
    return {
      success: true,
      data: attendances,
    };
  }
}


