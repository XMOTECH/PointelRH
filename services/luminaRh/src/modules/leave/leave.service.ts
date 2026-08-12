import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  // --- ACTIONS MANAGER / ADMIN ---

  async findAllRequests(companyId: string) {
    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        employee: { companyId },
      },
      include: {
        employee: true,
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(r => this.mapToLeaveRequestResource(r));
  }

  async updateStatus(companyId: string, id: string, dto: UpdateLeaveStatusDto, approverId: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: {
        id,
        employee: { companyId },
      },
      include: {
        leaveType: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Demande de congé introuvable');
    }

    // Update status
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejection_reason || null,
        approvedBy: dto.status === 'approved' ? approverId : null,
        approvedAt: dto.status === 'approved' ? new Date() : null,
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    // If approved, update balance
    if (dto.status === 'approved') {
      const days = request.daysCount || this.calculateDays(request.startDate, request.endDate, request.halfDay);
      await this.deductBalance(request.employeeId, request.leaveTypeId, days);
    }

    return this.mapToLeaveRequestResource(updated);
  }

  // --- ACTIONS EMPLOYE ---

  async findMyLeaves(employeeId: string) {
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId },
      include: {
        employee: true,
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(r => this.mapToLeaveRequestResource(r));
  }

  async findMyBalance(employeeId: string, year: number = 2026) {
    // Check if balances exist, if not initialize them for the active leave types of the company
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employé introuvable');
    }

    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { companyId: employee.companyId, isActive: true },
    });

    const balances = await Promise.all(
      leaveTypes.map(async (lt) => {
        let balance = await this.prisma.leaveBalance.findFirst({
          where: { employeeId, leaveTypeId: lt.id, year },
        });

        if (!balance) {
          // Initialize balance
          balance = await this.prisma.leaveBalance.create({
            data: {
              employeeId,
              leaveTypeId: lt.id,
              year,
              allocated: lt.maxDaysPerYear || lt.daysAllowed || 30.0,
              used: 0.0,
              pending: 0.0,
              remaining: lt.maxDaysPerYear || lt.daysAllowed || 30.0,
            },
          });
        }

        return balance;
      })
    );

    // Fetch them with leave type relationship
    const fullBalances = await this.prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { leaveType: true },
    });

    return fullBalances.map(b => ({
      id: b.id,
      leave_type_id: b.leaveTypeId,
      leave_type: {
        id: b.leaveType.id,
        name: b.leaveType.name,
        max_days_per_year: b.leaveType.maxDaysPerYear,
        requires_attachment: b.leaveType.requiresAttachment,
        paid: b.leaveType.paid,
        color: b.leaveType.color,
        is_active: b.leaveType.isActive,
      },
      year: b.year,
      allocated: b.allocated,
      used: b.used,
      pending: b.pending,
      remaining: b.remaining,
    }));
  }

  async createMyLeave(employeeId: string, companyId: string, dto: CreateLeaveRequestDto, file?: any) {
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id: dto.leave_type_id, companyId },
    });
    if (!leaveType) {
      throw new NotFoundException('Type de congé introuvable');
    }

    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);
    if (start > end) {
      throw new BadRequestException('La date de début doit être antérieure à la date de fin');
    }

    const days = this.calculateDays(start, end, dto.half_day || false);

    // Verify balance
    const balances = await this.findMyBalance(employeeId, start.getFullYear());
    const balance = balances.find(b => b.leave_type_id === dto.leave_type_id);
    if (balance && Number(balance.remaining) < days) {
      throw new BadRequestException(`Solde insuffisant. Jours demandés: ${days}, Solde restant: ${balance.remaining}`);
    }

    // Save request
    const request = await this.prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId: dto.leave_type_id,
        startDate: start,
        endDate: end,
        reason: dto.reason || null,
        status: 'pending',
        halfDay: dto.half_day || false,
        halfDayPeriod: dto.half_day_period || null,
        daysCount: days,
        attachmentPath: file ? file.path || file.url : null,
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    // Update pending balance
    await this.prisma.leaveBalance.updateMany({
      where: { employeeId, leaveTypeId: dto.leave_type_id, year: start.getFullYear() },
      data: {
        pending: { increment: days },
      },
    });

    return this.mapToLeaveRequestResource(request);
  }

  async cancelMyLeave(employeeId: string, id: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id, employeeId },
    });

    if (!request) {
      throw new NotFoundException('Demande de congé introuvable');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Seules les demandes de congé en attente peuvent être annulées');
    }

    // Release pending balance
    const days = request.daysCount || 0;
    await this.prisma.leaveBalance.updateMany({
      where: { employeeId, leaveTypeId: request.leaveTypeId, year: request.startDate.getFullYear() },
      data: {
        pending: { decrement: days },
      },
    });

    await this.prisma.leaveRequest.delete({ where: { id } });
    return { success: true, message: 'Demande de congé annulée avec succès' };
  }

  // --- LEAVE TYPES ---

  async getLeaveTypes(companyId: string) {
    const types = await this.prisma.leaveType.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return types.map(t => ({
      id: t.id,
      name: t.name,
      max_days_per_year: t.maxDaysPerYear,
      requires_attachment: t.requiresAttachment,
      paid: t.paid,
      color: t.color,
      is_active: t.isActive,
    }));
  }

  // --- HELPERS ---

  private calculateDays(start: Date, end: Date, isHalfDay: boolean): number {
    if (isHalfDay) return 0.5;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  private async deductBalance(employeeId: string, leaveTypeId: string, days: number) {
    const year = new Date().getFullYear();
    await this.prisma.leaveBalance.updateMany({
      where: { employeeId, leaveTypeId, year },
      data: {
        pending: { decrement: days },
        used: { increment: days },
        remaining: { decrement: days },
      },
    });
  }

  private mapToLeaveRequestResource(r: any) {
    return {
      id: r.id,
      employee_id: r.employeeId,
      employee_name: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : undefined,
      leave_type_id: r.leaveTypeId,
      leave_type: r.leaveType ? {
        id: r.leaveType.id,
        name: r.leaveType.name,
        max_days_per_year: r.leaveType.maxDaysPerYear,
        requires_attachment: r.leaveType.requiresAttachment,
        paid: r.leaveType.paid,
        color: r.leaveType.color,
        is_active: r.leaveType.isActive,
      } : r.leaveTypeId,
      start_date: r.startDate.toISOString().split('T')[0],
      end_date: r.endDate.toISOString().split('T')[0],
      reason: r.reason,
      rejection_reason: r.rejectionReason,
      status: r.status,
      approved_by: r.approvedBy,
      approved_at: r.approvedAt ? r.approvedAt.toISOString() : undefined,
      attachment_path: r.attachmentPath,
      half_day: r.halfDay,
      half_day_period: r.halfDayPeriod,
      days_count: r.daysCount,
      created_at: r.createdAt.toISOString(),
      employee: r.employee ? {
        id: r.employee.id,
        first_name: r.employee.firstName,
        last_name: r.employee.lastName,
      } : undefined,
    };
  }
}
