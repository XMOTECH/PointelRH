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
    const list = await this.prisma.advanceRequest.findMany({
      where: { employeeId },
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((r) => ({
      ...r,
      amount: Number(r.amount),
    }));
  }

  async findAll(companyId: string) {
    const list = await this.prisma.advanceRequest.findMany({
      where: companyId
        ? {
            employee: { companyId },
          }
        : {},
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((r) => ({
      ...r,
      amount: Number(r.amount),
    }));
  }

  async updateStatus(id: string, status: string, companyId?: string) {
    if (status !== 'approved' && status !== 'rejected') {
      throw new BadRequestException('Le statut doit être "approved" ou "rejected"');
    }

    const request = await this.prisma.advanceRequest.findFirst({
      where: {
        id,
        ...(companyId ? { employee: { companyId } } : {}),
      },
      include: { employee: true },
    });

    if (!request) {
      throw new NotFoundException('Demande d\'acompte introuvable dans votre entreprise');
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
