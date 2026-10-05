import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateScheduleDto) {
    const schedule = await this.prisma.schedule.create({
      data: {
        companyId,
        name: dto.name,
        startTime: dto.start_time || '08:00',
        endTime: dto.end_time || '17:00',
        graceMinutes: dto.grace_minutes ?? 15,
        workDays: dto.work_days && dto.work_days.length > 0 ? dto.work_days : [1, 2, 3, 4, 5],
      },
      include: {
        _count: { select: { employees: true } },
        employees: {
          select: { id: true, firstName: true, lastName: true, jobTitle: true },
          take: 6,
        },
      },
    });

    return this.mapToResource(schedule);
  }

  async findAll(companyId: string) {
    const schedules = await this.prisma.schedule.findMany({
      where: { companyId },
      include: {
        _count: { select: { employees: true } },
        employees: {
          select: { id: true, firstName: true, lastName: true, jobTitle: true },
          take: 12,
        },
      },
      orderBy: { name: 'asc' },
    });

    return schedules.map(s => this.mapToResource(s));
  }

  async findOne(companyId: string, id: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, companyId },
      include: {
        _count: { select: { employees: true } },
        employees: {
          select: { id: true, firstName: true, lastName: true, jobTitle: true },
          take: 12,
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Horaire introuvable');
    }

    return this.mapToResource(schedule);
  }

  async update(companyId: string, id: string, dto: UpdateScheduleDto) {
    await this.findOne(companyId, id);

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.start_time ? { startTime: dto.start_time } : {}),
        ...(dto.end_time ? { endTime: dto.end_time } : {}),
        ...(dto.grace_minutes !== undefined ? { graceMinutes: dto.grace_minutes } : {}),
        ...(dto.work_days ? { workDays: dto.work_days } : {}),
      },
      include: {
        _count: { select: { employees: true } },
        employees: {
          select: { id: true, firstName: true, lastName: true, jobTitle: true },
          take: 6,
        },
      },
    });

    return this.mapToResource(updated);
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);

    await this.prisma.schedule.delete({
      where: { id },
    });

    return { success: true };
  }

  async assignEmployees(companyId: string, scheduleId: string, employeeIds: string[]) {
    await this.findOne(companyId, scheduleId);

    // 1. Dé-assigner les employés qui ne sont plus dans la sélection
    if (employeeIds && employeeIds.length > 0) {
      await this.prisma.employee.updateMany({
        where: {
          companyId,
          scheduleId,
          id: { notIn: employeeIds },
        },
        data: {
          scheduleId: null,
        },
      });
    } else {
      await this.prisma.employee.updateMany({
        where: {
          companyId,
          scheduleId,
        },
        data: {
          scheduleId: null,
        },
      });
    }

    // 2. Assigner les employés sélectionnés
    if (employeeIds && employeeIds.length > 0) {
      await this.prisma.employee.updateMany({
        where: {
          companyId,
          id: { in: employeeIds },
        },
        data: {
          scheduleId,
        },
      });
    }

    return this.findOne(companyId, scheduleId);
  }

  private mapToResource(schedule: any) {
    return {
      id: schedule.id,
      name: schedule.name,
      start_time: schedule.startTime || '08:00',
      end_time: schedule.endTime || '17:00',
      work_days: schedule.workDays && schedule.workDays.length > 0 ? schedule.workDays : [1, 2, 3, 4, 5],
      grace_minutes: schedule.graceMinutes ?? 15,
      assigned_employees_count: schedule._count?.employees ?? 0,
      assigned_employees: (schedule.employees || []).map((e: any) => ({
        id: e.id,
        first_name: e.firstName,
        last_name: e.lastName,
        job_title: e.jobTitle,
      })),
      created_at: schedule.createdAt,
      updated_at: schedule.updatedAt,
    };
  }
}

