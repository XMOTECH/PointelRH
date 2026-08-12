import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdvanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(employeeId: string, amount: number, type: string, reason?: string) {
    // Validate type
    if (type !== 'advance' && type !== 'loan') {
      throw new BadRequestException('Le type de demande doit être "advance" ou "loan"');
    }

    // Get employee details to check salary cap
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employé introuvable');
    }

    // Acompte safety check (cap at 50% of salary if baseSalary > 0)
    const baseSalaryNum = Number(employee.baseSalary);
    if (type === 'advance' && baseSalaryNum > 0 && amount > baseSalaryNum * 0.5) {
      throw new BadRequestException('Le montant de l\'acompte ne peut pas dépasser 50% du salaire de base');
    }

    return this.prisma.advanceRequest.create({
      data: {
        employeeId,
        amount,
        type,
        reason,
        status: 'pending',
        repaid: false,
      },
      include: {
        employee: true,
      },
    });
  }

  async findAllForEmployee(employeeId: string) {
    return this.prisma.advanceRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.advanceRequest.findMany({
      where: {
        employee: { companyId },
      },
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    if (status !== 'approved' && status !== 'rejected') {
      throw new BadRequestException('Le statut doit être "approved" ou "rejected"');
    }

    const request = await this.prisma.advanceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Demande d\'acompte introuvable');
    }

    return this.prisma.advanceRequest.update({
      where: { id },
      data: { status },
      include: {
        employee: true,
      },
    });
  }
}
