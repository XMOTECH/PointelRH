import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ComplianceViolation {
  rule: 'LEAVE_CONFLICT' | 'SHIFT_OVERLAP' | 'DAILY_REST_INSUFFICIENT' | 'MAX_DAILY_HOURS' | 'MAX_WEEKLY_HOURS' | 'CONSECUTIVE_DAYS';
  severity: 'ERROR' | 'WARNING';
  message: string;
  shiftId?: string;
  employeeId?: string;
  date?: string;
  details?: Record<string, any>;
}

export interface ShiftTimeBlock {
  id?: string;
  employeeId?: string | null;
  date: Date | string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
}

@Injectable()
export class PlanningComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convertit "HH:mm" en minutes depuis minuit (0 à 1439).
   */
  timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  /**
   * Calcule la durée brute en minutes d'un shift, gérant les shifts de nuit chevauchant minuit.
   */
  calculateGrossMinutes(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (end > start) {
      return end - start;
    }
    // Shift de nuit (ex: 22h00 -> 06h00)
    return (24 * 60 - start) + end;
  }

  /**
   * Calcule la durée nette travaillée en minutes après déduction de la pause.
   */
  calculateNetMinutes(startTime: string, endTime: string, breakMinutes: number = 0): number {
    const gross = this.calculateGrossMinutes(startTime, endTime);
    return Math.max(0, gross - (breakMinutes || 0));
  }

  /**
   * Vérifie le chevauchement horaire entre deux shifts sur la même journée.
   */
  doShiftsOverlap(shiftA: { startTime: string; endTime: string }, shiftB: { startTime: string; endTime: string }): boolean {
    const startA = this.timeToMinutes(shiftA.startTime);
    let endA = this.timeToMinutes(shiftA.endTime);
    if (endA <= startA) endA += 24 * 60; // Gère le passage à minuit

    const startB = this.timeToMinutes(shiftB.startTime);
    let endB = this.timeToMinutes(shiftB.endTime);
    if (endB <= startB) endB += 24 * 60;

    return startA < endB && startB < endA;
  }

  /**
   * Calcule le temps de repos consécutif en minutes entre la fin d'un shift J-1 et le début d'un shift J.
   */
  calculateRestMinutesBetweenDays(previousEndTime: string, nextStartTime: string): number {
    const prevEnd = this.timeToMinutes(previousEndTime);
    const nextStart = this.timeToMinutes(nextStartTime);

    // Repos = temps restant dans la journée J-1 + temps écoulé dans la journée J
    return (24 * 60 - prevEnd) + nextStart;
  }

  /**
   * Valide un shift unique (avant création ou mise à jour).
   */
  async validateSingleShift(
    companyId: string,
    shift: ShiftTimeBlock,
    excludeShiftId?: string,
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    if (!shift.employeeId) return violations; // Pas de contraintes individuelles pour les shifts ouverts

    const shiftDate = new Date(shift.date);
    const dateStr = shiftDate.toISOString().split('T')[0];

    // 1. Règle : Vérification de congé validé
    const leaveConflict = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: shift.employeeId,
        status: 'approved',
        startDate: { lte: new Date(dateStr + 'T23:59:59Z') },
        endDate: { gte: new Date(dateStr + 'T00:00:00Z') },
      },
      include: { leaveType: true },
    });

    if (leaveConflict) {
      violations.push({
        rule: 'LEAVE_CONFLICT',
        severity: 'ERROR',
        message: `Le collaborateur est en congé validé (${leaveConflict.leaveType?.name || 'Absence'}) le ${dateStr}.`,
        employeeId: shift.employeeId,
        date: dateStr,
        details: { leaveId: leaveConflict.id, leaveType: leaveConflict.leaveType?.name },
      });
    }

    // 2. Règle : Durée quotidienne maximale (max 10h nettes en standard)
    const netMinutes = this.calculateNetMinutes(shift.startTime, shift.endTime, shift.breakMinutes);
    if (netMinutes > 10 * 60) {
      const netHours = (netMinutes / 60).toFixed(1);
      violations.push({
        rule: 'MAX_DAILY_HOURS',
        severity: 'WARNING',
        message: `Durée journalière excessive : ${netHours}h planifiées (limite légale standard : 10h).`,
        employeeId: shift.employeeId,
        date: dateStr,
        details: { netHours: Number(netHours), maxAllowed: 10 },
      });
    }

    // 3. Récupération des shifts de la même journée, de la veille (J-1) et du lendemain (J+1)
    const prevDay = new Date(shiftDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const nextDay = new Date(shiftDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const surroundingShifts = await this.prisma.shift.findMany({
      where: {
        employeeId: shift.employeeId,
        companyId,
        status: { not: 'CANCELLED' },
        ...(excludeShiftId ? { id: { not: excludeShiftId } } : {}),
        date: {
          gte: new Date(prevDay.toISOString().split('T')[0] + 'T00:00:00Z'),
          lte: new Date(nextDay.toISOString().split('T')[0] + 'T23:59:59Z'),
        },
      },
    });

    // 3a. Vérification de chevauchement sur la même journée
    const sameDayShifts = surroundingShifts.filter(
      (s) => s.date.toISOString().split('T')[0] === dateStr,
    );

    for (const other of sameDayShifts) {
      if (this.doShiftsOverlap(shift, other)) {
        violations.push({
          rule: 'SHIFT_OVERLAP',
          severity: 'ERROR',
          message: `Chevauchement d'horaires avec un autre shift (${other.startTime} - ${other.endTime}) le même jour.`,
          shiftId: other.id,
          employeeId: shift.employeeId,
          date: dateStr,
        });
      }
    }

    // 3b. Vérification du repos quotidien (min 11h entre shift veille et shift du jour)
    const prevDayShifts = surroundingShifts.filter(
      (s) => s.date.toISOString().split('T')[0] === prevDay.toISOString().split('T')[0],
    );

    for (const prev of prevDayShifts) {
      const restMinutes = this.calculateRestMinutesBetweenDays(prev.endTime, shift.startTime);
      if (restMinutes < 11 * 60) {
        const restHours = (restMinutes / 60).toFixed(1);
        violations.push({
          rule: 'DAILY_REST_INSUFFICIENT',
          severity: 'WARNING',
          message: `Temps de repos quotidien insuffisant : ${restHours}h entre la fin du shift précédent (${prev.endTime}) et le début (${shift.startTime}). Min légal : 11h.`,
          employeeId: shift.employeeId,
          date: dateStr,
          details: { restHours: Number(restHours), minimumRequired: 11 },
        });
      }
    }

    return violations;
  }

  /**
   * Analyse globale de conformité sur toute une semaine de planning.
   * Retourne un dictionnaire indexé par `employeeId` ou `shiftId`.
   */
  async evaluateWeeklyCompliance(
    companyId: string,
    weekStartDate: Date,
    weekEndDate: Date,
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Récupère tous les shifts actifs de la semaine
    const shifts = await this.prisma.shift.findMany({
      where: {
        companyId,
        date: { gte: weekStartDate, lte: weekEndDate },
        status: { not: 'CANCELLED' },
      },
      orderBy: [{ employeeId: 'asc' }, { date: 'asc' }, { startTime: 'asc' }],
    });

    // Regroupe par employé
    const shiftsByEmployee: Record<string, typeof shifts> = {};
    for (const s of shifts) {
      if (!s.employeeId) continue;
      if (!shiftsByEmployee[s.employeeId]) shiftsByEmployee[s.employeeId] = [];
      shiftsByEmployee[s.employeeId].push(s);
    }

    // Récupère les congés validés sur la semaine
    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        status: 'approved',
        employee: { companyId },
        startDate: { lte: weekEndDate },
        endDate: { gte: weekStartDate },
      },
      include: { leaveType: true },
    });

    for (const [employeeId, empShifts] of Object.entries(shiftsByEmployee)) {
      // 1. Total heures hebdomadaires
      let totalWeeklyMinutes = 0;
      const workedDays = new Set<string>();

      for (let i = 0; i < empShifts.length; i++) {
        const cur = empShifts[i];
        const dateStr = cur.date.toISOString().split('T')[0];
        workedDays.add(dateStr);

        const net = this.calculateNetMinutes(cur.startTime, cur.endTime, cur.breakMinutes);
        totalWeeklyMinutes += net;

        // Amplitude journalière > 10h
        if (net > 10 * 60) {
          violations.push({
            rule: 'MAX_DAILY_HOURS',
            severity: 'WARNING',
            message: `Durée journalière de ${(net / 60).toFixed(1)}h le ${dateStr} (limite : 10h).`,
            shiftId: cur.id,
            employeeId,
            date: dateStr,
          });
        }

        // Conflit avec congé
        const leave = leaves.find(
          (l) =>
            l.employeeId === employeeId &&
            l.startDate <= cur.date &&
            l.endDate >= cur.date,
        );
        if (leave) {
          violations.push({
            rule: 'LEAVE_CONFLICT',
            severity: 'ERROR',
            message: `Shift planifié le ${dateStr} pendant un congé validé (${leave.leaveType?.name || 'Absence'}).`,
            shiftId: cur.id,
            employeeId,
            date: dateStr,
          });
        }

        // Repos avec le shift suivant
        if (i < empShifts.length - 1) {
          const next = empShifts[i + 1];
          const curDay = cur.date.toISOString().split('T')[0];
          const nextDay = next.date.toISOString().split('T')[0];

          // Si ce sont 2 jours consécutifs
          const diffDays = (next.date.getTime() - cur.date.getTime()) / (1000 * 3600 * 24);
          if (Math.round(diffDays) === 1) {
            const rest = this.calculateRestMinutesBetweenDays(cur.endTime, next.startTime);
            if (rest < 11 * 60) {
              violations.push({
                rule: 'DAILY_REST_INSUFFICIENT',
                severity: 'WARNING',
                message: `Repos quotidien de ${(rest / 60).toFixed(1)}h entre le ${curDay} et le ${nextDay} (< 11h).`,
                shiftId: next.id,
                employeeId,
                date: nextDay,
              });
            }
          }
        }
      }

      // Alerte durée hebdomadaire max (> 48h légale)
      if (totalWeeklyMinutes > 48 * 60) {
        violations.push({
          rule: 'MAX_WEEKLY_HOURS',
          severity: 'WARNING',
          message: `Total hebdomadaire de ${(totalWeeklyMinutes / 60).toFixed(1)}h (limite légale : 48h).`,
          employeeId,
          details: { totalHours: Number((totalWeeklyMinutes / 60).toFixed(1)), maxAllowed: 48 },
        });
      }

      // Alerte 7 jours consécutifs travaillés sans repos
      if (workedDays.size >= 7) {
        violations.push({
          rule: 'CONSECUTIVE_DAYS',
          severity: 'ERROR',
          message: `Le collaborateur est planifié 7 jours sur 7 sans jour de repos hebdomadaire obligatoire.`,
          employeeId,
        });
      }
    }

    return violations;
  }
}
