import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PlanningComplianceService, ComplianceViolation } from './planning-compliance.service';
import { DuplicateWeekDto } from '../dto/planning-week.dto';

export interface EmployeeWeeklyStats {
  totalNetHours: number;
  totalBreakMinutes: number;
  shiftCount: number;
  violationsCount: number;
}

export interface DaySummary {
  date: string;
  totalNetHours: number;
  scheduledHeadcount: number;
  openShiftsCount: number;
}

@Injectable()
export class PlanningWeekService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly complianceService: PlanningComplianceService,
  ) {}

  /**
   * Normalise une date pour obtenir le lundi 00:00:00Z et le dimanche 23:59:59Z correspondants.
   */
  normalizeWeekBounds(dateStr: string): { weekStart: Date; weekEnd: Date; weekStartStr: string; weekEndStr: string } {
    const inputDate = new Date(dateStr + 'T00:00:00Z');
    if (isNaN(inputDate.getTime())) {
      throw new BadRequestException('Format de date invalide. Format attendu : YYYY-MM-DD');
    }

    // Calcul du lundi de la semaine (1 = Lundi, 0 = Dimanche)
    const day = inputDate.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day; // Si dimanche, recule de 6 jours, sinon 1 - day

    const weekStart = new Date(inputDate);
    weekStart.setUTCDate(inputDate.getUTCDate() + diffToMonday);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    return {
      weekStart,
      weekEnd,
      weekStartStr: weekStart.toISOString().split('T')[0],
      weekEndStr: weekEnd.toISOString().split('T')[0],
    };
  }

  /**
   * Récupère ou initialise la semaine de planning avec toutes les données consolidées.
   */
  async getOrCreateWeek(companyId: string, dateStr: string, departmentId?: string) {
    const { weekStart, weekEnd, weekStartStr, weekEndStr } = this.normalizeWeekBounds(dateStr);

    // 1. Récupère ou crée l'entité PlanningWeek
    let planningWeek = await this.prisma.planningWeek.findFirst({
      where: {
        companyId,
        weekStartDate: weekStart,
        ...(departmentId ? { departmentId } : {}),
      },
    });

    if (!planningWeek) {
      planningWeek = await this.prisma.planningWeek.create({
        data: {
          companyId,
          departmentId: departmentId || null,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          status: 'DRAFT',
        },
      });
    }

    // 2. Récupère tous les employés actifs
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        status: 'active',
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        department: true,
        schedule: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // 3. Récupère les shifts de la semaine (assignés et ouverts)
    const shifts = await this.prisma.shift.findMany({
      where: {
        companyId,
        date: { gte: weekStart, lte: weekEnd },
        status: { not: 'CANCELLED' },
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        template: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // 4. Récupère les congés approuvés
    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        status: 'approved',
        employee: { companyId },
        startDate: { lte: weekEnd },
        endDate: { gte: weekStart },
        ...(departmentId ? { employee: { departmentId } } : {}),
      },
      include: { leaveType: true },
    });

    // 5. Récupère les missions actives
    const assignments = await this.prisma.missionAssignment.findMany({
      where: {
        employee: { companyId, ...(departmentId ? { departmentId } : {}) },
        mission: {
          startDate: { lte: weekEnd },
          OR: [{ endDate: { gte: weekStart } }, { endDate: null }],
          status: { in: ['active', 'draft'] },
        },
      },
      include: { mission: true },
    });

    // 6. Évaluation globale de la conformité légale
    const violations = await this.complianceService.evaluateWeeklyCompliance(companyId, weekStart, weekEnd);

    // 7. Organisation par date et employé
    const weekDays: string[] = [];
    const cur = new Date(weekStart);
    while (cur <= weekEnd) {
      weekDays.push(cur.toISOString().split('T')[0]);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    // Shifts ouverts (non assignés)
    const openShifts = shifts.filter((s) => !s.employeeId || s.isUnassigned);

    // Statistiques par jour
    const daysSummary: Record<string, DaySummary> = {};
    for (const d of weekDays) {
      const dayShifts = shifts.filter((s) => s.date.toISOString().split('T')[0] === d);
      const dayOpen = dayShifts.filter((s) => !s.employeeId || s.isUnassigned);
      const assigned = dayShifts.filter((s) => s.employeeId && !s.isUnassigned);

      const netHours = assigned.reduce((sum, s) => {
        return sum + this.complianceService.calculateNetMinutes(s.startTime, s.endTime, s.breakMinutes) / 60;
      }, 0);

      const uniqueWorkers = new Set(assigned.map((s) => s.employeeId)).size;

      daysSummary[d] = {
        date: d,
        totalNetHours: Number(netHours.toFixed(1)),
        scheduledHeadcount: uniqueWorkers,
        openShiftsCount: dayOpen.length,
      };
    }

    // Lignes employés consolidées
    const employeeRows = employees.map((emp) => {
      const empShifts = shifts.filter((s) => s.employeeId === emp.id && !s.isUnassigned);
      const empLeaves = leaves.filter((l) => l.employeeId === emp.id);
      const empMissions = assignments.filter((a) => a.employeeId === emp.id);
      const empViolations = violations.filter((v) => v.employeeId === emp.id);

      // Calcul des stats employé
      let totalNetMinutes = 0;
      let totalBreakMinutes = 0;

      for (const s of empShifts) {
        totalNetMinutes += this.complianceService.calculateNetMinutes(s.startTime, s.endTime, s.breakMinutes);
        totalBreakMinutes += s.breakMinutes || 0;
      }

      // Construction des créneaux jour par jour
      const daysData: Record<string, any[]> = {};
      for (const d of weekDays) {
        daysData[d] = [];

        // Shifts réels
        const forDay = empShifts.filter((s) => s.date.toISOString().split('T')[0] === d);
        for (const s of forDay) {
          const shiftViolations = empViolations.filter((v) => v.shiftId === s.id || v.date === d);
          daysData[d].push({
            id: s.id,
            type: 'shift',
            status: s.status,
            startTime: s.startTime,
            endTime: s.endTime,
            breakMinutes: s.breakMinutes,
            jobTitle: s.jobTitle,
            color: s.color || '#3B82F6',
            notes: s.notes,
            violations: shiftViolations,
          });
        }

        // Congés
        const dayDate = new Date(d + 'T12:00:00Z');
        const leaveForDay = empLeaves.find((l) => l.startDate <= dayDate && l.endDate >= dayDate);
        if (leaveForDay) {
          daysData[d].push({
            id: `leave-${leaveForDay.id}`,
            type: 'leave',
            status: 'approved',
            title: leaveForDay.leaveType?.name || 'Congé',
            color: '#10B981', // Émeraude
          });
        }

        // Missions
        const missionForDay = empMissions.find(
          (m) => m.mission.startDate <= dayDate && (!m.mission.endDate || m.mission.endDate >= dayDate),
        );
        if (missionForDay && !leaveForDay) {
          daysData[d].push({
            id: `mission-${missionForDay.id}`,
            type: 'mission',
            status: missionForDay.mission.status,
            title: missionForDay.mission.title,
            color: '#6366F1', // Indigo
          });
        }
      }

      return {
        employee: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          jobTitle: emp.jobTitle,
          departmentName: emp.department?.name,
          standardScheduleName: emp.schedule?.name,
        },
        stats: {
          totalNetHours: Number((totalNetMinutes / 60).toFixed(1)),
          totalBreakMinutes,
          shiftCount: empShifts.length,
          violationsCount: empViolations.length,
        },
        violations: empViolations,
        days: daysData,
      };
    });

    return {
      planningWeek: {
        id: planningWeek.id,
        weekStartDate: weekStartStr,
        weekEndDate: weekEndStr,
        status: planningWeek.status,
        publishedAt: planningWeek.publishedAt,
        publishedBy: planningWeek.publishedBy,
        notes: planningWeek.notes,
      },
      weekDays,
      daysSummary,
      openShifts,
      violations,
      employees: employeeRows,
    };
  }

  /**
   * Publie la semaine de planning (passage de DRAFT à PUBLISHED).
   */
  async publishWeek(companyId: string, dateStr: string, userId: string, departmentId?: string) {
    const { weekStart, weekEnd } = this.normalizeWeekBounds(dateStr);

    const planningWeek = await this.prisma.planningWeek.findFirst({
      where: {
        companyId,
        weekStartDate: weekStart,
        ...(departmentId ? { departmentId } : {}),
      },
    });

    if (!planningWeek) {
      throw new NotFoundException('Semaine de planning introuvable');
    }

    // Met à jour la semaine et tous les shifts de la semaine
    const [updatedWeek] = await this.prisma.$transaction([
      this.prisma.planningWeek.update({
        where: { id: planningWeek.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedBy: userId,
        },
      }),
      this.prisma.shift.updateMany({
        where: {
          companyId,
          date: { gte: weekStart, lte: weekEnd },
          status: 'DRAFT',
          ...(departmentId ? { departmentId } : {}),
        },
        data: {
          status: 'PUBLISHED',
        },
      }),
    ]);

    return {
      success: true,
      message: 'Planning hebdomadaire publié avec succès.',
      data: updatedWeek,
    };
  }

  /**
   * Duplique tous les shifts d'une semaine source vers une semaine cible.
   */
  async duplicateWeek(companyId: string, dto: DuplicateWeekDto, userId: string) {
    const sourceBounds = this.normalizeWeekBounds(dto.sourceWeekStart);
    const targetBounds = this.normalizeWeekBounds(dto.targetWeekStart);

    // Vérifie les shifts sources
    const sourceShifts = await this.prisma.shift.findMany({
      where: {
        companyId,
        date: { gte: sourceBounds.weekStart, lte: sourceBounds.weekEnd },
        status: { not: 'CANCELLED' },
        ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
      },
    });

    if (sourceShifts.length === 0) {
      throw new BadRequestException('Aucun shift trouvé sur la semaine source à dupliquer.');
    }

    // Détermine le décalage en jours (par ex: 7 jours pour la semaine suivante)
    const dayOffset = Math.round(
      (targetBounds.weekStart.getTime() - sourceBounds.weekStart.getTime()) / (1000 * 3600 * 24),
    );

    // Initialise la PlanningWeek cible en DRAFT
    let targetWeek = await this.prisma.planningWeek.findFirst({
      where: {
        companyId,
        weekStartDate: targetBounds.weekStart,
        ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
      },
    });

    if (!targetWeek) {
      targetWeek = await this.prisma.planningWeek.create({
        data: {
          companyId,
          departmentId: dto.departmentId || null,
          weekStartDate: targetBounds.weekStart,
          weekEndDate: targetBounds.weekEnd,
          status: 'DRAFT',
        },
      });
    }

    // Gestion de l'écrasement optionnel
    if (dto.overwriteExisting) {
      await this.prisma.shift.deleteMany({
        where: {
          companyId,
          date: { gte: targetBounds.weekStart, lte: targetBounds.weekEnd },
          ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
        },
      });
    }

    // Prépare les nouveaux shifts avec les dates décalées
    const newShiftsData = sourceShifts.map((s) => {
      const newDate = new Date(s.date);
      newDate.setUTCDate(newDate.getUTCDate() + dayOffset);

      return {
        companyId,
        planningWeekId: targetWeek.id,
        templateId: s.templateId,
        employeeId: s.employeeId,
        departmentId: s.departmentId,
        date: newDate,
        startTime: s.startTime,
        endTime: s.endTime,
        breakMinutes: s.breakMinutes,
        jobTitle: s.jobTitle,
        color: s.color,
        notes: s.notes,
        status: 'DRAFT', // Toute duplication commence en brouillon
        isUnassigned: s.isUnassigned,
      };
    });

    await this.prisma.shift.createMany({
      data: newShiftsData,
    });

    return {
      success: true,
      message: `${newShiftsData.length} shifts dupliqués avec succès pour la semaine du ${targetBounds.weekStartStr}.`,
      duplicatedCount: newShiftsData.length,
      targetWeekId: targetWeek.id,
    };
  }

  /**
   * Récupère le planning de l'employé connecté (shifts publiés, congés, missions).
   */
  async getMyShifts(companyId: string, userId: string, dateStr?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, companyId },
      include: { schedule: true },
    });

    if (!employee) {
      throw new NotFoundException('Fiche employé introuvable.');
    }

    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const { weekStart, weekEnd, weekStartStr, weekEndStr } = this.normalizeWeekBounds(targetDate);

    const shifts = await this.prisma.shift.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: weekStart, lte: weekEnd },
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: employee.id,
        status: 'approved',
        startDate: { lte: weekEnd },
        endDate: { gte: weekStart },
      },
      include: { leaveType: true },
    });

    const assignments = await this.prisma.missionAssignment.findMany({
      where: {
        employeeId: employee.id,
        mission: {
          startDate: { lte: weekEnd },
          OR: [{ endDate: { gte: weekStart } }, { endDate: null }],
        },
      },
      include: { mission: true },
    });

    return {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        jobTitle: employee.jobTitle,
      },
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      standardSchedule: employee.schedule,
      shifts,
      leaves,
      missions: assignments.map((a) => a.mission),
    };
  }
}
