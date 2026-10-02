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
      },
    });

    return this.mapToResource(schedule);
  }

  async findAll(companyId: string) {
    const schedules = await this.prisma.schedule.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    return schedules.map(s => this.mapToResource(s));
  }

  async findOne(companyId: string, id: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, companyId },
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

  private mapToResource(schedule: {
    id: string;
    name: string;
    startTime?: string | null;
    endTime?: string | null;
    graceMinutes?: number | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: schedule.id,
      name: schedule.name,
      start_time: schedule.startTime || '08:00',
      end_time: schedule.endTime || '17:00',
      work_days: [1, 2, 3, 4, 5],
      grace_minutes: schedule.graceMinutes ?? 15,
      created_at: schedule.createdAt,
      updated_at: schedule.updatedAt,
    };
  }
}
