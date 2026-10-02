import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { CreateObjectiveDto, UpdateObjectiveDto } from '../dto/create-objective.dto';
import { ObjectiveStatus } from '../entities/performance.enums';

@Injectable()
export class PerformanceObjectiveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, user: CurrentUserDto, dto: CreateObjectiveDto) {
    return this.prisma.performanceObjective.create({
      data: {
        companyId,
        employeeId: dto.employeeId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        weight: dto.weight || 1,
        targetValue: dto.targetValue,
        unit: dto.unit,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: ObjectiveStatus.NOT_STARTED,
        progress: 0,
      },
    });
  }

  async findAll(companyId: string, user: CurrentUserDto, employeeId?: string) {
    const where: any = { companyId };

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    if (!isAdmin) {
      if (user.role === 'manager' && employeeId) {
        where.employeeId = employeeId;
      } else if (user.employeeId) {
        where.employeeId = user.employeeId;
      }
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    return this.prisma.performanceObjective.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(companyId: string, id: string, user: CurrentUserDto, dto: UpdateObjectiveDto) {
    const objective = await this.prisma.performanceObjective.findFirst({
      where: { id, companyId },
    });

    if (!objective) {
      throw new NotFoundException(`Objectif ${id} introuvable.`);
    }

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isOwner = user.employeeId === objective.employeeId;

    if (!isAdmin && !isOwner && user.role !== 'manager') {
      throw new ForbiddenException('Non autorisé à modifier cet objectif.');
    }

    let progress = dto.progress !== undefined ? dto.progress : objective.progress;
    let status = dto.status || (objective.status as ObjectiveStatus);

    if (progress >= 100 && status !== ObjectiveStatus.EXCEEDED) {
      status = ObjectiveStatus.ACHIEVED;
    } else if (progress > 0 && status === ObjectiveStatus.NOT_STARTED) {
      status = ObjectiveStatus.IN_PROGRESS;
    }

    return this.prisma.performanceObjective.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        currentValue: dto.currentValue,
        progress,
        status,
      },
    });
  }

  async delete(companyId: string, id: string) {
    const objective = await this.prisma.performanceObjective.findFirst({
      where: { id, companyId },
    });

    if (!objective) {
      throw new NotFoundException(`Objectif ${id} introuvable.`);
    }

    return this.prisma.performanceObjective.delete({
      where: { id },
    });
  }
}
