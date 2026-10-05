import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlanningWeekService } from '../services/planning-week.service';
import { WorkShiftService } from '../services/work-shift.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DuplicateWeekDto, PublishWeekDto } from '../dto/planning-week.dto';

@ApiTags('Planning')
@ApiBearerAuth('keycloak-token')
@Controller('planning')
export class PlanningWeekController {
  constructor(
    private readonly planningWeekService: PlanningWeekService,
    private readonly workShiftService: WorkShiftService,
  ) {}

  @Get('week')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Récupérer la matrice hebdomadaire complète du planning',
    description: 'Retourne la semaine consolidée avec shifts, congés, missions, alertes de conformité et compteurs d\'heures.',
  })
  @ApiQuery({ name: 'date', required: true, description: 'Une date dans la semaine (YYYY-MM-DD)' })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filtrer par département' })
  @ApiResponse({ status: 200, description: 'Matrice hebdomadaire récupérée avec succès.' })
  async getWeek(
    @CurrentUser('companyId') companyId: string,
    @Query('date') date: string,
    @Query('department_id') departmentId?: string,
  ) {
    const data = await this.planningWeekService.getOrCreateWeek(companyId, date, departmentId);
    return {
      success: true,
      data,
    };
  }

  @Get('my-shifts')
  @Roles({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Consulter mes shifts de travail (Espace Salarié)',
    description: 'Retourne les shifts publiés, congés et missions du collaborateur connecté pour la semaine.',
  })
  @ApiQuery({ name: 'date', required: false, description: 'Date de référence (YYYY-MM-DD), par défaut aujourd\'hui' })
  @ApiResponse({ status: 200, description: 'Shifts de l\'employé récupérés.' })
  async getMyShifts(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Query('date') date?: string,
  ) {
    const data = await this.planningWeekService.getMyShifts(companyId, userId, date);
    return {
      success: true,
      data,
    };
  }

  @Post('week/publish')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Publier la semaine de planning',
    description: 'Fait passer la semaine et ses shifts de l\'état DRAFT à PUBLISHED, les rendant officiels et visibles.',
  })
  @ApiResponse({ status: 200, description: 'Planning publié.' })
  async publishWeek(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PublishWeekDto,
  ) {
    return this.planningWeekService.publishWeek(companyId, dto.weekStart, userId, dto.departmentId);
  }

  @Post('week/duplicate')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Dupliquer une semaine vers une autre',
    description: 'Copie l\'intégralité des shifts d\'une semaine source vers une semaine cible avec recalcul des dates.',
  })
  @ApiResponse({ status: 201, description: 'Semaine dupliquée.' })
  async duplicateWeek(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: DuplicateWeekDto,
  ) {
    return this.planningWeekService.duplicateWeek(companyId, dto, userId);
  }

  /**
   * Endpoint de rétro-compatibilité avec les formulaires rapides de planning.
   * Désormais réellement persisté en base de données !
   */
  @Post('override')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Modifier rapidement le planning d\'un employé',
    description: 'Enregistre une modification réelle d\'horaire ou un jour de repos pour un collaborateur.',
  })
  async saveOverride(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const employeeId = body.employee_id || body.employeeId;
    const date = body.date;
    const isOff = body.is_off ?? body.isOff;
    const startTime = body.start_time || body.startTime || '08:00';
    const endTime = body.end_time || body.endTime || '17:00';
    const reason = body.reason;

    if (isOff) {
      // Si repos demandé, on annule ou supprime le shift existant ce jour-là
      const existing = await this.workShiftService['prisma'].shift.findFirst({
        where: {
          companyId,
          employeeId,
          date: new Date(date + 'T00:00:00Z'),
        },
      });

      if (existing) {
        await this.workShiftService.remove(companyId, existing.id);
      }

      return {
        success: true,
        message: 'Jour de repos enregistré.',
        data: { date, status: 'off', reason },
      };
    }

    // Sinon, on crée ou met à jour le shift
    const existing = await this.workShiftService['prisma'].shift.findFirst({
      where: {
        companyId,
        employeeId,
        date: new Date(date + 'T00:00:00Z'),
      },
    });

    if (existing) {
      const result = await this.workShiftService.update(
        companyId,
        existing.id,
        { startTime, endTime, notes: reason },
        userId,
      );
      return {
        success: true,
        message: 'Planning mis à jour.',
        data: result.shift,
        violations: result.violations,
      };
    }

    const result = await this.workShiftService.create(
      companyId,
      {
        employeeId,
        date,
        startTime,
        endTime,
        notes: reason,
      },
      userId,
    );

    return {
      success: true,
      message: 'Shift créé avec succès.',
      data: result.shift,
      violations: result.violations,
    };
  }
}
