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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    prisma;
    dashboardCache = new Map();
    CACHE_TTL_MS = 5 * 60 * 1000;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(companyId) {
        const now = Date.now();
        const cached = this.dashboardCache.get(companyId);
        if (cached && cached.expiresAt > now) {
            this.logger.log(`[AnalyticsService] Serving dashboard stats from memory cache for company ${companyId}`);
            return cached.data;
        }
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const totalEmployees = await this.prisma.employee.count({
            where: { companyId, status: 'active' },
        });
        const presentCount = await this.prisma.attendance.count({
            where: {
                employee: { companyId },
                clockIn: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
        const lateCount = await this.prisma.attendance.count({
            where: {
                employee: { companyId },
                isLate: true,
                clockIn: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
        const absentCount = Math.max(0, totalEmployees - presentCount);
        const result = {
            total_employees: totalEmployees,
            present_count: presentCount,
            late_count: lateCount,
            absent_count: absentCount,
            date: todayStart.toISOString().split('T')[0],
        };
        this.dashboardCache.set(companyId, {
            data: result,
            expiresAt: now + this.CACHE_TTL_MS,
        });
        return result;
    }
    handleAttendanceRecorded(payload) {
        this.logger.log(`[AnalyticsService] Invalidating dashboard cache for company ${payload.companyId} due to new attendance`);
        this.dashboardCache.delete(payload.companyId);
    }
    async getDepartmentStats(companyId) {
        const departments = await this.prisma.department.findMany({
            where: { companyId },
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });
        return departments.map((d) => ({
            department_name: d.name,
            employee_count: d._count.employees,
        }));
    }
    async getPresenceTrend(companyId) {
        const snapshots = await this.prisma.dailySnapshot.findMany({
            where: { companyId },
            orderBy: { date: 'desc' },
            take: 7,
        });
        return snapshots.map((s) => ({
            date: s.date.toISOString().split('T')[0],
            present: s.presentCount,
            absent: s.absentCount,
            late: s.lateCount,
        }));
    }
};
exports.AnalyticsService = AnalyticsService;
__decorate([
    (0, event_emitter_1.OnEvent)('attendance.recorded'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsService.prototype, "handleAttendanceRecorded", null);
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map