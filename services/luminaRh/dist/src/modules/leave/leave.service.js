"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LeaveService = class LeaveService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllRequests(companyId) {
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
    async updateStatus(companyId, id, dto, approverId) {
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
            throw new common_1.NotFoundException('Demande de congé introuvable');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException(`Cette demande de congé a déjà été traitée (statut actuel: ${request.status})`);
        }
        const days = request.daysCount || this.calculateDays(request.startDate, request.endDate, request.halfDay);
        const leaveYear = request.startDate.getFullYear();
        const updated = await this.prisma.$transaction(async (tx) => {
            const up = await tx.leaveRequest.update({
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
            if (dto.status === 'approved') {
                await tx.leaveBalance.updateMany({
                    where: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year: leaveYear },
                    data: {
                        pending: { decrement: days },
                        used: { increment: days },
                        remaining: { decrement: days },
                    },
                });
            }
            else if (dto.status === 'rejected') {
                await tx.leaveBalance.updateMany({
                    where: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year: leaveYear },
                    data: {
                        pending: { decrement: days },
                    },
                });
            }
            return up;
        });
        return this.mapToLeaveRequestResource(updated);
    }
    async findMyLeaves(employeeId) {
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
    async findMyBalance(employeeId, year = 2026) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        const leaveTypes = await this.prisma.leaveType.findMany({
            where: { companyId: employee.companyId, isActive: true },
        });
        const balances = await Promise.all(leaveTypes.map(async (lt) => {
            let balance = await this.prisma.leaveBalance.findFirst({
                where: { employeeId, leaveTypeId: lt.id, year },
            });
            if (!balance) {
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
        }));
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
                max_days_per_year: b.leaveType.maxDaysPerYear ? Number(b.leaveType.maxDaysPerYear) : null,
                requires_attachment: b.leaveType.requiresAttachment,
                paid: b.leaveType.paid,
                color: b.leaveType.color,
                is_active: b.leaveType.isActive,
            },
            year: b.year,
            allocated: Number(b.allocated || 0),
            used: Number(b.used || 0),
            pending: Number(b.pending || 0),
            remaining: Number(b.remaining || 0),
        }));
    }
    async createMyLeave(employeeId, companyId, dto, file) {
        const leaveType = await this.prisma.leaveType.findFirst({
            where: { id: dto.leave_type_id, companyId },
        });
        if (!leaveType) {
            throw new common_1.NotFoundException('Type de congé introuvable');
        }
        const start = new Date(dto.start_date);
        const end = new Date(dto.end_date);
        if (start > end) {
            throw new common_1.BadRequestException('La date de début doit être antérieure à la date de fin');
        }
        const days = this.calculateDays(start, end, dto.half_day || false);
        const balances = await this.findMyBalance(employeeId, start.getFullYear());
        const balance = balances.find(b => b.leave_type_id === dto.leave_type_id);
        if (balance) {
            const netAvailable = Number(balance.remaining) - Number(balance.pending);
            if (netAvailable < days) {
                throw new common_1.BadRequestException(`Solde insuffisant. Jours demandés: ${days}, Solde net disponible (après demandes en attente): ${netAvailable}`);
            }
        }
        const request = await this.prisma.$transaction(async (tx) => {
            const req = await tx.leaveRequest.create({
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
            await tx.leaveBalance.updateMany({
                where: { employeeId, leaveTypeId: dto.leave_type_id, year: start.getFullYear() },
                data: {
                    pending: { increment: days },
                },
            });
            return req;
        });
        return this.mapToLeaveRequestResource(request);
    }
    async cancelMyLeave(employeeId, id) {
        const request = await this.prisma.leaveRequest.findFirst({
            where: { id, employeeId },
        });
        if (!request) {
            throw new common_1.NotFoundException('Demande de congé introuvable');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Seules les demandes de congé en attente peuvent être annulées');
        }
        const days = request.daysCount || 0;
        await this.prisma.$transaction(async (tx) => {
            await tx.leaveBalance.updateMany({
                where: { employeeId, leaveTypeId: request.leaveTypeId, year: request.startDate.getFullYear() },
                data: {
                    pending: { decrement: days },
                },
            });
            await tx.leaveRequest.delete({ where: { id } });
        });
        return { success: true, message: 'Demande de congé annulée avec succès' };
    }
    async getLeaveTypes(companyId) {
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
    calculateDays(start, end, isHalfDay) {
        if (isHalfDay)
            return 0.5;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    }
    async deductBalance(employeeId, leaveTypeId, days) {
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
    mapToLeaveRequestResource(r) {
        return {
            id: r.id,
            employee_id: r.employeeId,
            employee_name: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : undefined,
            leave_type_id: r.leaveTypeId,
            leave_type: r.leaveType ? {
                id: r.leaveType.id,
                name: r.leaveType.name,
                max_days_per_year: r.leaveType.maxDaysPerYear ? Number(r.leaveType.maxDaysPerYear) : null,
                requires_attachment: r.leaveType.requiresAttachment,
                paid: r.leaveType.paid,
                color: r.leaveType.color,
                is_active: r.leaveType.isActive,
            } : r.leaveTypeId,
            start_date: r.startDate ? r.startDate.toISOString().split('T')[0] : '',
            end_date: r.endDate ? r.endDate.toISOString().split('T')[0] : '',
            reason: r.reason,
            rejection_reason: r.rejectionReason,
            status: r.status,
            approved_by: r.approvedBy,
            approved_at: r.approvedAt ? r.approvedAt.toISOString() : undefined,
            attachment_path: r.attachmentPath,
            half_day: r.halfDay,
            half_day_period: r.halfDayPeriod,
            days_count: r.daysCount ? Number(r.daysCount) : 0,
            created_at: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
            employee: r.employee ? {
                id: r.employee.id,
                first_name: r.employee.firstName,
                last_name: r.employee.lastName,
            } : undefined,
        };
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map