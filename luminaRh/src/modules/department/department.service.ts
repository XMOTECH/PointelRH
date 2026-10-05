import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    if (dto.manager_id) {
      const emp = await this.prisma.employee.findFirst({
        where: { id: dto.manager_id, companyId },
      });
      if (!emp) {
        throw new NotFoundException('Employé désigné comme manager introuvable dans cette entreprise');
      }
      await this.prisma.employee.update({
        where: { id: dto.manager_id },
        data: { departmentId: department.id },
      });
      if (emp.userId) {
        await this.prisma.user.update({
          where: { id: emp.userId },
          data: { role: 'manager' },
        });
      }
    }

    return this.findOne(companyId, department.id);
  }

  async findAll(companyId: string) {
    const departments = await this.prisma.department.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { role: true } },
          },
        },
      },
    });

    return departments.map(d => {
      const manager = d.employees.find(e => e.user?.role === 'manager' || e.user?.role === 'admin') || d.employees[0];
      return {
        id: d.id,
        name: d.name,
        manager_name: manager ? `${manager.firstName} ${manager.lastName}`.trim() : null,
        employee_count: d.employees.length,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
      };
    });
  }

  async findOne(companyId: string, id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { role: true } },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Département introuvable');
    }

    const manager = department.employees.find(e => e.user?.role === 'manager' || e.user?.role === 'admin') || department.employees[0];
    return {
      id: department.id,
      name: department.name,
      manager_name: manager ? `${manager.firstName} ${manager.lastName}`.trim() : null,
      employee_count: department.employees.length,
      created_at: department.createdAt,
      updated_at: department.updatedAt,
    };
  }

  async update(companyId: string, id: string, dto: UpdateDepartmentDto) {
    await this.findOne(companyId, id);

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
      },
    });

    if (dto.manager_id) {
      const emp = await this.prisma.employee.findFirst({
        where: { id: dto.manager_id, companyId },
      });
      if (!emp) {
        throw new NotFoundException('Employé désigné comme manager introuvable dans cette entreprise');
      }
      await this.prisma.employee.update({
        where: { id: dto.manager_id },
        data: { departmentId: id },
      });
      if (emp.userId) {
        await this.prisma.user.update({
          where: { id: emp.userId },
          data: { role: 'manager' },
        });
      }
    }

    return this.findOne(companyId, id);
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);

    const employeeCount = await this.prisma.employee.count({
      where: { departmentId: id, companyId },
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer ce département car il contient encore ${employeeCount} employé(s). Veuillez les réaffecter d'abord.`
      );
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return { success: true };
  }
}
