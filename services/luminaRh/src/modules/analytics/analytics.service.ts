import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private dashboardCache = new Map<string, { data: any; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(companyId: string) {
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

    // 1. Total employees in company
    const totalEmployees = await this.prisma.employee.count({
      where: { companyId, status: 'active' },
    });

    // 2. Present employees today
    const presentCount = await this.prisma.attendance.count({
      where: {
        employee: { companyId },
        clockIn: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // 3. Late employees today
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

    // Save in cache
    this.dashboardCache.set(companyId, {
      data: result,
      expiresAt: now + this.CACHE_TTL_MS,
    });

    return result;
  }

  @OnEvent('attendance.recorded')
  handleAttendanceRecorded(payload: { companyId: string }) {
    this.logger.log(`[AnalyticsService] Invalidating dashboard cache for company ${payload.companyId} due to new attendance`);
    this.dashboardCache.delete(payload.companyId);
  }

  async getDepartmentStats(companyId: string) {
    // Group employee counts by department
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

  async getPresenceTrend(companyId: string) {
    // Generate simple historical data from snapshots or raw attendances
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
}
