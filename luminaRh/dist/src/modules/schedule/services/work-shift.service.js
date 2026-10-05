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
exports.WorkShiftService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const planning_compliance_service_1 = require("./planning-compliance.service");
let WorkShiftService = class WorkShiftService {
    prisma;
    complianceService;
    constructor(prisma, complianceService) {
        this.prisma = prisma;
        this.complianceService = complianceService;
    }
    async create(companyId, dto, userId) {
        const shiftDate = new Date(dto.date + 'T00:00:00Z');
        if (isNaN(shiftDate.getTime())) {
            throw new common_1.BadRequestException('Format de date invalide (YYYY-MM-DD attendu).');
        }
        const day = shiftDate.getUTCDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(shiftDate);
        weekStart.setUTCDate(shiftDate.getUTCDate() + diffToMonday);
        weekStart.setUTCHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
        weekEnd.setUTCHours(23, 59, 59, 999);
        let planningWeek = await this.prisma.planningWeek.findFirst({
            where: {
                companyId,
                weekStartDate: weekStart,
                ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
            },
        });
        if (!planningWeek) {
            planningWeek = await this.prisma.planningWeek.create({
                data: {
                    companyId,
                    departmentId: dto.departmentId || null,
                    weekStartDate: weekStart,
                    weekEndDate: weekEnd,
                    status: 'DRAFT',
                },
            });
        }
        const violations = await this.complianceService.validateSingleShift(companyId, {
            employeeId: dto.employeeId,
            date: shiftDate,
            startTime: dto.startTime,
            endTime: dto.endTime,
            breakMinutes: dto.breakMinutes || 0,
        });
        const shift = await this.prisma.shift.create({
            data: {
                companyId,
                planningWeekId: planningWeek.id,
                templateId: dto.templateId || null,
                employeeId: dto.employeeId || null,
                departmentId: dto.departmentId || null,
                date: shiftDate,
                startTime: dto.startTime,
                endTime: dto.endTime,
                breakMinutes: dto.breakMinutes ?? 0,
                jobTitle: dto.jobTitle || null,
                color: dto.color || '#3B82F6',
                notes: dto.notes || null,
                status: planningWeek.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
                isUnassigned: !dto.employeeId || !!dto.isUnassigned,
            },
            include: {
                employee: true,
                template: true,
            },
        });
        return {
            shift,
            violations,
        };
    }
    async update(companyId, id, dto, userId) {
        const existing = await this.prisma.shift.findFirst({
            where: { id, companyId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Shift introuvable.');
        }
        const shiftDate = dto.date ? new Date(dto.date + 'T00:00:00Z') : existing.date;
        const employeeId = dto.employeeId !== undefined ? dto.employeeId : existing.employeeId;
        const startTime = dto.startTime || existing.startTime;
        const endTime = dto.endTime || existing.endTime;
        const breakMinutes = dto.breakMinutes !== undefined ? dto.breakMinutes : existing.breakMinutes;
        const violations = await this.complianceService.validateSingleShift(companyId, {
            employeeId,
            date: shiftDate,
            startTime,
            endTime,
            breakMinutes,
        }, id);
        const updated = await this.prisma.shift.update({
            where: { id },
            data: {
                ...(dto.employeeId !== undefined ? { employeeId: dto.employeeId, isUnassigned: !dto.employeeId } : {}),
                ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
                ...(dto.templateId !== undefined ? { templateId: dto.templateId } : {}),
                ...(dto.date ? { date: shiftDate } : {}),
                ...(dto.startTime ? { startTime } : {}),
                ...(dto.endTime ? { endTime } : {}),
                ...(dto.breakMinutes !== undefined ? { breakMinutes } : {}),
                ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
                ...(dto.color !== undefined ? { color: dto.color } : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
                ...(dto.status ? { status: dto.status } : {}),
            },
            include: {
                employee: true,
                template: true,
            },
        });
        return {
            shift: updated,
            violations,
        };
    }
    async move(companyId, id, dto, userId) {
        const existing = await this.prisma.shift.findFirst({
            where: { id, companyId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Shift introuvable.');
        }
        const newDate = dto.date ? new Date(dto.date + 'T00:00:00Z') : existing.date;
        const newEmployeeId = dto.employeeId !== undefined ? dto.employeeId : existing.employeeId;
        const newStartTime = dto.startTime || existing.startTime;
        const newEndTime = dto.endTime || existing.endTime;
        const violations = await this.complianceService.validateSingleShift(companyId, {
            employeeId: newEmployeeId,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            breakMinutes: existing.breakMinutes,
        }, id);
        const updated = await this.prisma.shift.update({
            where: { id },
            data: {
                date: newDate,
                employeeId: newEmployeeId,
                isUnassigned: !newEmployeeId,
                startTime: newStartTime,
                endTime: newEndTime,
            },
            include: {
                employee: true,
                template: true,
            },
        });
        return {
            shift: updated,
            violations,
        };
    }
    async remove(companyId, id) {
        const existing = await this.prisma.shift.findFirst({
            where: { id, companyId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Shift introuvable.');
        }
        await this.prisma.shift.delete({
            where: { id },
        });
        return { success: true, message: 'Shift supprimé.' };
    }
};
exports.WorkShiftService = WorkShiftService;
exports.WorkShiftService = WorkShiftService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        planning_compliance_service_1.PlanningComplianceService])
], WorkShiftService);
//# sourceMappingURL=work-shift.service.js.map