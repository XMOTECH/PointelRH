import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build the weekly timeline grid for the WeeklyPlanningPage.
   * For each active employee, returns their shift/leave/mission data for every day in [start, end].
   */
  async getTeamTimeline(companyId: string, start: string, end: string, departmentId?: string) {
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59Z');

    // 1. Get all active employees
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

    // 2. Build the timeline for each employee
    return employees.map((emp) => {
      // Build a consolidated list of "shifts" (work blocks, leaves, missions)
      const allShifts: any[] = [];

      // Add actual shifts from DB
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

      // Add approved leave days
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

      // Add mission days
      for (const assignment of emp.assignments) {
        const mission = assignment.mission;
        const mStart = new Date(Math.max(mission.startDate.getTime(), startDate.getTime()));
        const mEnd = mission.endDate
          ? new Date(Math.min(mission.endDate.getTime(), endDate.getTime()))
          : endDate;

        const current = new Date(mStart);
        while (current <= mEnd) {
          // Don't add mission shift if there's already a leave on that day
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

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
