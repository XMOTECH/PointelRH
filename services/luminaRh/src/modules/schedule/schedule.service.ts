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
        name: dto.name,
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

  private mapToResource(schedule: { id: string; name: string; createdAt: Date; updatedAt: Date }) {
    return {
      id: schedule.id,
      name: schedule.name,
      start_time: null,
      end_time: null,
      work_days: [],
      grace_minutes: null,
      created_at: schedule.createdAt,
      updated_at: schedule.updatedAt,
    };
  }
}
