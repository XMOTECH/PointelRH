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
exports.TimelineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TimelineService = class TimelineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTeamTimeline(companyId, start, end, departmentId) {
        const startDate = new Date(start + 'T00:00:00Z');
        const endDate = new Date(end + 'T23:59:59Z');
        const employees = await this.prisma.employee.findMany({
            where: {
                companyId,
                status: 'active',
                ...(departmentId ? { departmentId } : {}),
            },
            include: {
                schedule: true,
                shifts: {
                    where: {
                        date: { gte: startDate, lte: endDate },
                    },
                    orderBy: { date: 'asc' },
                },
                leaveRequests: {
                    where: {
                        status: 'approved',
                        startDate: { lte: endDate },
                        endDate: { gte: startDate },
                    },
                    include: { leaveType: true },
                },
                assignments: {
                    where: {
                        mission: {
                            startDate: { lte: endDate },
                            OR: [
                                { endDate: { gte: startDate } },
                                { endDate: null },
                            ],
                            status: { in: ['active', 'draft'] },
                        },
                    },
                    include: {
                        mission: true,
                    },
                },
            },
            orderBy: { lastName: 'asc' },
        });
        return employees.map((emp) => {
            const allShifts = [];
            for (const shift of emp.shifts) {
                allShifts.push({
                    id: shift.id,
                    date: this.formatDate(shift.date),
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    status: 'work',
                    type: 'shift',
                    isOverride: false,
                });
            }
            for (const leave of emp.leaveRequests) {
                const current = new Date(Math.max(leave.startDate.getTime(), startDate.getTime()));
                const leaveEnd = new Date(Math.min(leave.endDate.getTime(), endDate.getTime()));
                while (current <= leaveEnd) {
                    allShifts.push({
                        id: `leave-${leave.id}-${this.formatDate(current)}`,
                        date: this.formatDate(current),
                        startTime: null,
                        endTime: null,
                        status: 'leave',
                        type: 'leave',
                        reason: leave.leaveType?.name || 'Congé',
                        isOverride: false,
                    });
                    current.setDate(current.getDate() + 1);
                }
            }
            for (const assignment of emp.assignments) {
                const mission = assignment.mission;
                const mStart = new Date(Math.max(mission.startDate.getTime(), startDate.getTime()));
                const mEnd = mission.endDate
                    ? new Date(Math.min(mission.endDate.getTime(), endDate.getTime()))
                    : endDate;
                const current = new Date(mStart);
                while (current <= mEnd) {
                    const dateStr = this.formatDate(current);
                    const hasLeave = allShifts.some(s => s.date === dateStr && s.status === 'leave');
                    if (!hasLeave) {
                        allShifts.push({
                            id: `mission-${assignment.id}-${dateStr}`,
                            date: dateStr,
                            startTime: '08:00',
                            endTime: '17:00',
                            status: 'work',
                            type: 'mission',
                            missionTitle: mission.title,
                            isOverride: false,
                        });
                    }
                    current.setDate(current.getDate() + 1);
                }
            }
            return {
                employeeId: emp.id,
                firstName: emp.firstName,
                lastName: emp.lastName,
                scheduleName: emp.schedule?.name || null,
                shifts: allShifts,
            };
        });
    }
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
};
exports.TimelineService = TimelineService;
exports.TimelineService = TimelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimelineService);
//# sourceMappingURL=timeline.service.js.map