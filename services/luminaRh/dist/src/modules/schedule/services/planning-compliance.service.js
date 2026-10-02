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
exports.PlanningComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PlanningComplianceService = class PlanningComplianceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0);
    }
    calculateGrossMinutes(startTime, endTime) {
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        if (end > start) {
            return end - start;
        }
        return (24 * 60 - start) + end;
    }
    calculateNetMinutes(startTime, endTime, breakMinutes = 0) {
        const gross = this.calculateGrossMinutes(startTime, endTime);
        return Math.max(0, gross - (breakMinutes || 0));
    }
    doShiftsOverlap(shiftA, shiftB) {
        const startA = this.timeToMinutes(shiftA.startTime);
        let endA = this.timeToMinutes(shiftA.endTime);
        if (endA <= startA)
            endA += 24 * 60;
        const startB = this.timeToMinutes(shiftB.startTime);
        let endB = this.timeToMinutes(shiftB.endTime);
        if (endB <= startB)
            endB += 24 * 60;
        return startA < endB && startB < endA;
    }
    calculateRestMinutesBetweenDays(previousEndTime, nextStartTime) {
        const prevEnd = this.timeToMinutes(previousEndTime);
        const nextStart = this.timeToMinutes(nextStartTime);
        return (24 * 60 - prevEnd) + nextStart;
    }
    async validateSingleShift(companyId, shift, excludeShiftId) {
        const violations = [];
        if (!shift.employeeId)
            return violations;
        const shiftDate = new Date(shift.date);
        const dateStr = shiftDate.toISOString().split('T')[0];
        const leaveConflict = await this.prisma.leaveRequest.findFirst({
            where: {
                employeeId: shift.employeeId,
                status: 'approved',
                startDate: { lte: new Date(dateStr + 'T23:59:59Z') },
                endDate: { gte: new Date(dateStr + 'T00:00:00Z') },
            },
            include: { leaveType: true },
        });
        if (leaveConflict) {
            violations.push({
                rule: 'LEAVE_CONFLICT',
                severity: 'ERROR',
                message: `Le collaborateur est en congé validé (${leaveConflict.leaveType?.name || 'Absence'}) le ${dateStr}.`,
                employeeId: shift.employeeId,
                date: dateStr,
                details: { leaveId: leaveConflict.id, leaveType: leaveConflict.leaveType?.name },
            });
        }
        const netMinutes = this.calculateNetMinutes(shift.startTime, shift.endTime, shift.breakMinutes);
        if (netMinutes > 10 * 60) {
            const netHours = (netMinutes / 60).toFixed(1);
            violations.push({
                rule: 'MAX_DAILY_HOURS',
                severity: 'WARNING',
                message: `Durée journalière excessive : ${netHours}h planifiées (limite légale standard : 10h).`,
                employeeId: shift.employeeId,
                date: dateStr,
                details: { netHours: Number(netHours), maxAllowed: 10 },
            });
        }
        const prevDay = new Date(shiftDate);
        prevDay.setDate(prevDay.getDate() - 1);
        const nextDay = new Date(shiftDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const surroundingShifts = await this.prisma.shift.findMany({
            where: {
                employeeId: shift.employeeId,
                companyId,
                status: { not: 'CANCELLED' },
                ...(excludeShiftId ? { id: { not: excludeShiftId } } : {}),
                date: {
                    gte: new Date(prevDay.toISOString().split('T')[0] + 'T00:00:00Z'),
                    lte: new Date(nextDay.toISOString().split('T')[0] + 'T23:59:59Z'),
                },
            },
        });
        const sameDayShifts = surroundingShifts.filter((s) => s.date.toISOString().split('T')[0] === dateStr);
        for (const other of sameDayShifts) {
            if (this.doShiftsOverlap(shift, other)) {
                violations.push({
                    rule: 'SHIFT_OVERLAP',
                    severity: 'ERROR',
                    message: `Chevauchement d'horaires avec un autre shift (${other.startTime} - ${other.endTime}) le même jour.`,
                    shiftId: other.id,
                    employeeId: shift.employeeId,
                    date: dateStr,
                });
            }
        }
        const prevDayShifts = surroundingShifts.filter((s) => s.date.toISOString().split('T')[0] === prevDay.toISOString().split('T')[0]);
        for (const prev of prevDayShifts) {
            const restMinutes = this.calculateRestMinutesBetweenDays(prev.endTime, shift.startTime);
            if (restMinutes < 11 * 60) {
                const restHours = (restMinutes / 60).toFixed(1);
                violations.push({
                    rule: 'DAILY_REST_INSUFFICIENT',
                    severity: 'WARNING',
                    message: `Temps de repos quotidien insuffisant : ${restHours}h entre la fin du shift précédent (${prev.endTime}) et le début (${shift.startTime}). Min légal : 11h.`,
                    employeeId: shift.employeeId,
                    date: dateStr,
                    details: { restHours: Number(restHours), minimumRequired: 11 },
                });
            }
        }
        return violations;
    }
    async evaluateWeeklyCompliance(companyId, weekStartDate, weekEndDate) {
        const violations = [];
        const shifts = await this.prisma.shift.findMany({
            where: {
                companyId,
                date: { gte: weekStartDate, lte: weekEndDate },
                status: { not: 'CANCELLED' },
            },
            orderBy: [{ employeeId: 'asc' }, { date: 'asc' }, { startTime: 'asc' }],
        });
        const shiftsByEmployee = {};
        for (const s of shifts) {
            if (!s.employeeId)
                continue;
            if (!shiftsByEmployee[s.employeeId])
                shiftsByEmployee[s.employeeId] = [];
            shiftsByEmployee[s.employeeId].push(s);
        }
        const leaves = await this.prisma.leaveRequest.findMany({
            where: {
                status: 'approved',
                employee: { companyId },
                startDate: { lte: weekEndDate },
                endDate: { gte: weekStartDate },
            },
            include: { leaveType: true },
        });
        for (const [employeeId, empShifts] of Object.entries(shiftsByEmployee)) {
            let totalWeeklyMinutes = 0;
            const workedDays = new Set();
            for (let i = 0; i < empShifts.length; i++) {
                const cur = empShifts[i];
                const dateStr = cur.date.toISOString().split('T')[0];
                workedDays.add(dateStr);
                const net = this.calculateNetMinutes(cur.startTime, cur.endTime, cur.breakMinutes);
                totalWeeklyMinutes += net;
                if (net > 10 * 60) {
                    violations.push({
                        rule: 'MAX_DAILY_HOURS',
                        severity: 'WARNING',
                        message: `Durée journalière de ${(net / 60).toFixed(1)}h le ${dateStr} (limite : 10h).`,
                        shiftId: cur.id,
                        employeeId,
                        date: dateStr,
                    });
                }
                const leave = leaves.find((l) => l.employeeId === employeeId &&
                    l.startDate <= cur.date &&
                    l.endDate >= cur.date);
                if (leave) {
                    violations.push({
                        rule: 'LEAVE_CONFLICT',
                        severity: 'ERROR',
                        message: `Shift planifié le ${dateStr} pendant un congé validé (${leave.leaveType?.name || 'Absence'}).`,
                        shiftId: cur.id,
                        employeeId,
                        date: dateStr,
                    });
                }
                if (i < empShifts.length - 1) {
                    const next = empShifts[i + 1];
                    const curDay = cur.date.toISOString().split('T')[0];
                    const nextDay = next.date.toISOString().split('T')[0];
                    const diffDays = (next.date.getTime() - cur.date.getTime()) / (1000 * 3600 * 24);
                    if (Math.round(diffDays) === 1) {
                        const rest = this.calculateRestMinutesBetweenDays(cur.endTime, next.startTime);
                        if (rest < 11 * 60) {
                            violations.push({
                                rule: 'DAILY_REST_INSUFFICIENT',
                                severity: 'WARNING',
                                message: `Repos quotidien de ${(rest / 60).toFixed(1)}h entre le ${curDay} et le ${nextDay} (< 11h).`,
                                shiftId: next.id,
                                employeeId,
                                date: nextDay,
                            });
                        }
                    }
                }
            }
            if (totalWeeklyMinutes > 48 * 60) {
                violations.push({
                    rule: 'MAX_WEEKLY_HOURS',
                    severity: 'WARNING',
                    message: `Total hebdomadaire de ${(totalWeeklyMinutes / 60).toFixed(1)}h (limite légale : 48h).`,
                    employeeId,
                    details: { totalHours: Number((totalWeeklyMinutes / 60).toFixed(1)), maxAllowed: 48 },
                });
            }
            if (workedDays.size >= 7) {
                violations.push({
                    rule: 'CONSECUTIVE_DAYS',
                    severity: 'ERROR',
                    message: `Le collaborateur est planifié 7 jours sur 7 sans jour de repos hebdomadaire obligatoire.`,
                    employeeId,
                });
            }
        }
        return violations;
    }
};
exports.PlanningComplianceService = PlanningComplianceService;
exports.PlanningComplianceService = PlanningComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanningComplianceService);
//# sourceMappingURL=planning-compliance.service.js.map