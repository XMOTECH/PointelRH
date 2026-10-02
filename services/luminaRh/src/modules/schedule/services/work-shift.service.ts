import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PlanningComplianceService, ComplianceViolation } from './planning-compliance.service';
import { CreateShiftDto, UpdateShiftDto, MoveShiftDto } from '../dto';

@Injectable()
export class WorkShiftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly complianceService: PlanningComplianceService,
  ) {}

  /**
   * Crée un nouveau shift de travail (assigné ou ouvert).
   */
  async create(companyId: string, dto: CreateShiftDto, userId: string) {
    const shiftDate = new Date(dto.date + 'T00:00:00Z');
    if (isNaN(shiftDate.getTime())) {
      throw new BadRequestException('Format de date invalide (YYYY-MM-DD attendu).');
    }

    // 1. Détermine le lundi correspondant pour lier à la PlanningWeek
    const day = shiftDate.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(shiftDate);
    weekStart.setUTCDate(shiftDate.getUTCDate() + diffToMonday);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    let planningWeek = await this.prisma.planningWeek.findFirst({
      where: {
        companyId,
        weekStartDate: weekStart,
        ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
      },
    });

    if (!planningWeek) {
      planningWeek = await this.prisma.planningWeek.create({
        data: {
          companyId,
          departmentId: dto.departmentId || null,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          status: 'DRAFT',
        },
      });
    }

    // 2. Contrôle de conformité légale en amont
    const violations = await this.complianceService.validateSingleShift(companyId, {
      employeeId: dto.employeeId,
      date: shiftDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      breakMinutes: dto.breakMinutes || 0,
    });

    // 3. Persistance en base
    const shift = await this.prisma.shift.create({
      data: {
        companyId,
        planningWeekId: planningWeek.id,
        templateId: dto.templateId || null,
        employeeId: dto.employeeId || null,
        departmentId: dto.departmentId || null,
        date: shiftDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        breakMinutes: dto.breakMinutes ?? 0,
        jobTitle: dto.jobTitle || null,
        color: dto.color || '#3B82F6',
        notes: dto.notes || null,
        status: planningWeek.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        isUnassigned: !dto.employeeId || !!dto.isUnassigned,
      },
      include: {
        employee: true,
        template: true,
      },
    });

    return {
      shift,
      violations,
    };
  }

  /**
   * Met à jour un shift existant.
   */
  async update(companyId: string, id: string, dto: UpdateShiftDto, userId: string) {
    const existing = await this.prisma.shift.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new NotFoundException('Shift introuvable.');
    }

    const shiftDate = dto.date ? new Date(dto.date + 'T00:00:00Z') : existing.date;
    const employeeId = dto.employeeId !== undefined ? dto.employeeId : existing.employeeId;
    const startTime = dto.startTime || existing.startTime;
    const endTime = dto.endTime || existing.endTime;
    const breakMinutes = dto.breakMinutes !== undefined ? dto.breakMinutes : existing.breakMinutes;

    // Contrôle de conformité
    const violations = await this.complianceService.validateSingleShift(
      companyId,
      {
        employeeId,
        date: shiftDate,
        startTime,
        endTime,
        breakMinutes,
      },
      id,
    );

    const updated = await this.prisma.shift.update({
      where: { id },
      data: {
        ...(dto.employeeId !== undefined ? { employeeId: dto.employeeId, isUnassigned: !dto.employeeId } : {}),
        ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
        ...(dto.templateId !== undefined ? { templateId: dto.templateId } : {}),
        ...(dto.date ? { date: shiftDate } : {}),
        ...(dto.startTime ? { startTime } : {}),
        ...(dto.endTime ? { endTime } : {}),
        ...(dto.breakMinutes !== undefined ? { breakMinutes } : {}),
        ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
      include: {
        employee: true,
        template: true,
      },
    });

    return {
      shift: updated,
      violations,
    };
  }

  /**
   * Déplace rapidement un shift (optimisé pour le glisser-déposer / Drag & Drop).
   */
  async move(companyId: string, id: string, dto: MoveShiftDto, userId: string) {
    const existing = await this.prisma.shift.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new NotFoundException('Shift introuvable.');
    }

    const newDate = dto.date ? new Date(dto.date + 'T00:00:00Z') : existing.date;
    const newEmployeeId = dto.employeeId !== undefined ? dto.employeeId : existing.employeeId;
    const newStartTime = dto.startTime || existing.startTime;
    const newEndTime = dto.endTime || existing.endTime;

    // Contrôle de conformité
    const violations = await this.complianceService.validateSingleShift(
      companyId,
      {
        employeeId: newEmployeeId,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        breakMinutes: existing.breakMinutes,
      },
      id,
    );

    const updated = await this.prisma.shift.update({
      where: { id },
      data: {
        date: newDate,
        employeeId: newEmployeeId,
        isUnassigned: !newEmployeeId,
        startTime: newStartTime,
        endTime: newEndTime,
      },
      include: {
        employee: true,
        template: true,
      },
    });

    return {
      shift: updated,
      violations,
    };
  }

  /**
   * Supprime un shift.
   */
  async remove(companyId: string, id: string) {
    const existing = await this.prisma.shift.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new NotFoundException('Shift introuvable.');
    }

    await this.prisma.shift.delete({
      where: { id },
    });

    return { success: true, message: 'Shift supprimé.' };
  }
}
