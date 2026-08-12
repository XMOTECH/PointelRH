import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateDepartmentDto) {
    const department = await this.prisma.department.create({
      data: {
        companyId,
        name: dto.name,
      },
    });

    return this.mapToResource(department);
  }

  async findAll(companyId: string) {
    const departments = await this.prisma.department.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    return departments.map(d => this.mapToResource(d));
  }

  async findOne(companyId: string, id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId },
    });

    if (!department) {
      throw new NotFoundException('Département introuvable');
    }

    return this.mapToResource(department);
  }

  async update(companyId: string, id: string, dto: UpdateDepartmentDto) {
    await this.findOne(companyId, id);

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });

    return this.mapToResource(updated);
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);

    await this.prisma.department.delete({
      where: { id },
    });

    return { success: true };
  }

  private mapToResource(dept: { id: string; name: string; createdAt: Date; updatedAt: Date }) {
    return {
      id: dept.id,
      name: dept.name,
      parent_id: null,
      created_at: dept.createdAt,
      updated_at: dept.updatedAt,
    };
  }
}
