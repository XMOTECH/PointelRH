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
exports.PlanningWeekService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const planning_compliance_service_1 = require("./planning-compliance.service");
let PlanningWeekService = class PlanningWeekService {
    prisma;
    complianceService;
    constructor(prisma, complianceService) {
        this.prisma = prisma;
        this.complianceService = complianceService;
    }
    normalizeWeekBounds(dateStr) {
        const inputDate = new Date(dateStr + 'T00:00:00Z');
        if (isNaN(inputDate.getTime())) {
            throw new common_1.BadRequestException('Format de date invalide. Format attendu : YYYY-MM-DD');
        }
        const day = inputDate.getUTCDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(inputDate);
        weekStart.setUTCDate(inputDate.getUTCDate() + diffToMonday);
        weekStart.setUTCHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
        weekEnd.setUTCHours(23, 59, 59, 999);
        return {
            weekStart,
            weekEnd,
            weekStartStr: weekStart.toISOString().split('T')[0],
            weekEndStr: weekEnd.toISOString().split('T')[0],
        };
    }
    async getOrCreateWeek(companyId, dateStr, departmentId) {
        const { weekStart, weekEnd, weekStartStr, weekEndStr } = this.normalizeWeekBounds(dateStr);
        let planningWeek = await this.prisma.planningWeek.findFirst({
            where: {
                companyId,
                weekStartDate: weekStart,
                ...(departmentId ? { departmentId } : {}),
            },
        });
        if (!planningWeek) {
            planningWeek = await this.prisma.planningWeek.create({
                data: {
                    companyId,
                    departmentId: departmentId || null,
                    weekStartDate: weekStart,
                    weekEndDate: weekEnd,
                    status: 'DRAFT',
                },
            });
        }
        const employees = await this.prisma.employee.findMany({
            where: {
                companyId,
                status: 'active',
                ...(departmentId ? { departmentId } : {}),
            },
            include: {
                department: true,
                schedule: true,
            },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        });
        const shifts = await this.prisma.shift.findMany({
            where: {
                companyId,
                date: { gte: weekStart, lte: weekEnd },
                status: { not: 'CANCELLED' },
                ...(departmentId ? { departmentId } : {}),
            },
            include: {
                template: true,
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
        const leaves = await this.prisma.leaveRequest.findMany({
            where: {
                status: 'approved',
                employee: { companyId },
                startDate: { lte: weekEnd },
                endDate: { gte: weekStart },
                ...(departmentId ? { employee: { departmentId } } : {}),
            },
            include: { leaveType: true },
        });
        const assignments = await this.prisma.missionAssignment.findMany({
            where: {
                employee: { companyId, ...(departmentId ? { departmentId } : {}) },
                mission: {
                    startDate: { lte: weekEnd },
                    OR: [{ endDate: { gte: weekStart } }, { endDate: null }],
                    status: { in: ['active', 'draft'] },
                },
            },
            include: { mission: true },
        });
        const violations = await this.complianceService.evaluateWeeklyCompliance(companyId, weekStart, weekEnd);
        const weekDays = [];
        const cur = new Date(weekStart);
        while (cur <= weekEnd) {
            weekDays.push(cur.toISOString().split('T')[0]);
            cur.setUTCDate(cur.getUTCDate() + 1);
        }
        const openShifts = shifts.filter((s) => !s.employeeId || s.isUnassigned);
        const daysSummary = {};
        for (const d of weekDays) {
            const dayShifts = shifts.filter((s) => s.date.toISOString().split('T')[0] === d);
            const dayOpen = dayShifts.filter((s) => !s.employeeId || s.isUnassigned);
            const assigned = dayShifts.filter((s) => s.employeeId && !s.isUnassigned);
            const netHours = assigned.reduce((sum, s) => {
                return sum + this.complianceService.calculateNetMinutes(s.startTime, s.endTime, s.breakMinutes) / 60;
            }, 0);
            const uniqueWorkers = new Set(assigned.map((s) => s.employeeId)).size;
            daysSummary[d] = {
                date: d,
                totalNetHours: Number(netHours.toFixed(1)),
                scheduledHeadcount: uniqueWorkers,
                openShiftsCount: dayOpen.length,
            };
        }
        const employeeRows = employees.map((emp) => {
            const empShifts = shifts.filter((s) => s.employeeId === emp.id && !s.isUnassigned);
            const empLeaves = leaves.filter((l) => l.employeeId === emp.id);
            const empMissions = assignments.filter((a) => a.employeeId === emp.id);
            const empViolations = violations.filter((v) => v.employeeId === emp.id);
            let totalNetMinutes = 0;
            let totalBreakMinutes = 0;
            for (const s of empShifts) {
                totalNetMinutes += this.complianceService.calculateNetMinutes(s.startTime, s.endTime, s.breakMinutes);
                totalBreakMinutes += s.breakMinutes || 0;
            }
            const daysData = {};
            for (const d of weekDays) {
                daysData[d] = [];
                const forDay = empShifts.filter((s) => s.date.toISOString().split('T')[0] === d);
                for (const s of forDay) {
                    const shiftViolations = empViolations.filter((v) => v.shiftId === s.id || v.date === d);
                    daysData[d].push({
                        id: s.id,
                        type: 'shift',
                        status: s.status,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        breakMinutes: s.breakMinutes,
                        jobTitle: s.jobTitle,
                        color: s.color || '#3B82F6',
                        notes: s.notes,
                        violations: shiftViolations,
                    });
                }
                const dayDate = new Date(d + 'T12:00:00Z');
                const leaveForDay = empLeaves.find((l) => l.startDate <= dayDate && l.endDate >= dayDate);
                if (leaveForDay) {
                    daysData[d].push({
                        id: `leave-${leaveForDay.id}`,
                        type: 'leave',
                        status: 'approved',
                        title: leaveForDay.leaveType?.name || 'Congé',
                        color: '#10B981',
                    });
                }
                const missionForDay = empMissions.find((m) => m.mission.startDate <= dayDate && (!m.mission.endDate || m.mission.endDate >= dayDate));
                if (missionForDay && !leaveForDay) {
                    daysData[d].push({
                        id: `mission-${missionForDay.id}`,
                        type: 'mission',
                        status: missionForDay.mission.status,
                        title: missionForDay.mission.title,
                        color: '#6366F1',
                    });
                }
            }
            return {
                employee: {
                    id: emp.id,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    jobTitle: emp.jobTitle,
                    departmentName: emp.department?.name,
                    standardScheduleName: emp.schedule?.name,
                },
                stats: {
                    totalNetHours: Number((totalNetMinutes / 60).toFixed(1)),
                    totalBreakMinutes,
                    shiftCount: empShifts.length,
                    violationsCount: empViolations.length,
                },
                violations: empViolations,
                days: daysData,
            };
        });
        return {
            planningWeek: {
                id: planningWeek.id,
                weekStartDate: weekStartStr,
                weekEndDate: weekEndStr,
                status: planningWeek.status,
                publishedAt: planningWeek.publishedAt,
                publishedBy: planningWeek.publishedBy,
                notes: planningWeek.notes,
            },
            weekDays,
            daysSummary,
            openShifts,
            violations,
            employees: employeeRows,
        };
    }
    async publishWeek(companyId, dateStr, userId, departmentId) {
        const { weekStart, weekEnd } = this.normalizeWeekBounds(dateStr);
        const planningWeek = await this.prisma.planningWeek.findFirst({
            where: {
                companyId,
                weekStartDate: weekStart,
                ...(departmentId ? { departmentId } : {}),
            },
        });
        if (!planningWeek) {
            throw new common_1.NotFoundException('Semaine de planning introuvable');
        }
        const [updatedWeek] = await this.prisma.$transaction([
            this.prisma.planningWeek.update({
                where: { id: planningWeek.id },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                    publishedBy: userId,
                },
            }),
            this.prisma.shift.updateMany({
                where: {
                    companyId,
                    date: { gte: weekStart, lte: weekEnd },
                    status: 'DRAFT',
                    ...(departmentId ? { departmentId } : {}),
                },
                data: {
                    status: 'PUBLISHED',
                },
            }),
        ]);
        return {
            success: true,
            message: 'Planning hebdomadaire publié avec succès.',
            data: updatedWeek,
        };
    }
    async duplicateWeek(companyId, dto, userId) {
        const sourceBounds = this.normalizeWeekBounds(dto.sourceWeekStart);
        const targetBounds = this.normalizeWeekBounds(dto.targetWeekStart);
        const sourceShifts = await this.prisma.shift.findMany({
            where: {
                companyId,
                date: { gte: sourceBounds.weekStart, lte: sourceBounds.weekEnd },
                status: { not: 'CANCELLED' },
                ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
            },
        });
        if (sourceShifts.length === 0) {
            throw new common_1.BadRequestException('Aucun shift trouvé sur la semaine source à dupliquer.');
        }
        const dayOffset = Math.round((targetBounds.weekStart.getTime() - sourceBounds.weekStart.getTime()) / (1000 * 3600 * 24));
        let targetWeek = await this.prisma.planningWeek.findFirst({
            where: {
                companyId,
                weekStartDate: targetBounds.weekStart,
                ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
            },
        });
        if (!targetWeek) {
            targetWeek = await this.prisma.planningWeek.create({
                data: {
                    companyId,
                    departmentId: dto.departmentId || null,
                    weekStartDate: targetBounds.weekStart,
                    weekEndDate: targetBounds.weekEnd,
                    status: 'DRAFT',
                },
            });
        }
        if (dto.overwriteExisting) {
            await this.prisma.shift.deleteMany({
                where: {
                    companyId,
                    date: { gte: targetBounds.weekStart, lte: targetBounds.weekEnd },
                    ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
                },
            });
        }
        const newShiftsData = sourceShifts.map((s) => {
            const newDate = new Date(s.date);
            newDate.setUTCDate(newDate.getUTCDate() + dayOffset);
            return {
                companyId,
                planningWeekId: targetWeek.id,
                templateId: s.templateId,
                employeeId: s.employeeId,
                departmentId: s.departmentId,
                date: newDate,
                startTime: s.startTime,
                endTime: s.endTime,
                breakMinutes: s.breakMinutes,
                jobTitle: s.jobTitle,
                color: s.color,
                notes: s.notes,
                status: 'DRAFT',
                isUnassigned: s.isUnassigned,
            };
        });
        await this.prisma.shift.createMany({
            data: newShiftsData,
        });
        return {
            success: true,
            message: `${newShiftsData.length} shifts dupliqués avec succès pour la semaine du ${targetBounds.weekStartStr}.`,
            duplicatedCount: newShiftsData.length,
            targetWeekId: targetWeek.id,
        };
    }
    async getMyShifts(companyId, userId, dateStr) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, companyId },
            include: { schedule: true },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Fiche employé introuvable.');
        }
        const targetDate = dateStr || new Date().toISOString().split('T')[0];
        const { weekStart, weekEnd, weekStartStr, weekEndStr } = this.normalizeWeekBounds(targetDate);
        const shifts = await this.prisma.shift.findMany({
            where: {
                employeeId: employee.id,
                date: { gte: weekStart, lte: weekEnd },
                status: { in: ['PUBLISHED', 'CONFIRMED'] },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
        const leaves = await this.prisma.leaveRequest.findMany({
            where: {
                employeeId: employee.id,
                status: 'approved',
                startDate: { lte: weekEnd },
                endDate: { gte: weekStart },
            },
            include: { leaveType: true },
        });
        const assignments = await this.prisma.missionAssignment.findMany({
            where: {
                employeeId: employee.id,
                mission: {
                    startDate: { lte: weekEnd },
                    OR: [{ endDate: { gte: weekStart } }, { endDate: null }],
                },
            },
            include: { mission: true },
        });
        return {
            employee: {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                jobTitle: employee.jobTitle,
            },
            weekStart: weekStartStr,
            weekEnd: weekEndStr,
            standardSchedule: employee.schedule,
            shifts,
            leaves,
            missions: assignments.map((a) => a.mission),
        };
    }
};
exports.PlanningWeekService = PlanningWeekService;
exports.PlanningWeekService = PlanningWeekService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        planning_compliance_service_1.PlanningComplianceService])
], PlanningWeekService);
//# sourceMappingURL=planning-week.service.js.map