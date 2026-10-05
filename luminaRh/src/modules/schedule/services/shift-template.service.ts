import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '../dto/shift-template.dto';

@Injectable()
export class ShiftTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateShiftTemplateDto) {
    return this.prisma.shiftTemplate.create({
      data: {
        companyId,
        departmentId: dto.departmentId || null,
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
        breakMinutes: dto.breakMinutes ?? 0,
        color: dto.color || '#3B82F6',
        jobTitle: dto.jobTitle || null,
      },
    });
  }

  async findAll(companyId: string, departmentId?: string) {
    return this.prisma.shiftTemplate.findMany({
      where: {
        companyId,
        isActive: true,
        ...(departmentId ? { OR: [{ departmentId }, { departmentId: null }] } : {}),
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const template = await this.prisma.shiftTemplate.findFirst({
      where: { id, companyId },
    });

    if (!template) {
      throw new NotFoundException('Modèle de shift introuvable.');
    }

    return template;
  }

  async update(companyId: string, id: string, dto: UpdateShiftTemplateDto) {
    await this.findOne(companyId, id);

    return this.prisma.shiftTemplate.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.startTime ? { startTime: dto.startTime } : {}),
        ...(dto.endTime ? { endTime: dto.endTime } : {}),
        ...(dto.breakMinutes !== undefined ? { breakMinutes: dto.breakMinutes } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);

    // Soft delete (désactivation)
    return this.prisma.shiftTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
