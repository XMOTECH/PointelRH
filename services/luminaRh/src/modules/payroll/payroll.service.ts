import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to compute calendar week key (Year-Week) for grouping attendances.
   */
  private getWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Set to Thursday of current week to handle ISO week boundary correctly
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const year = d.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const week = Math.ceil((((d.getTime() - startOfYear.getTime()) / 86400000) + 1) / 7);
    return `${year}-W${week}`;
  }

  /**
   * Consolidate monthly payroll variables for all active employees.
   */
  async getPrePayroll(companyId: string, monthYear?: string) {
    // Default to current month if not specified
    const now = new Date();
    const currentMonth = monthYear ? parseInt(monthYear.split('-')[0]) - 1 : now.getMonth();
    const currentYear = monthYear ? parseInt(monthYear.split('-')[1]) : now.getFullYear();

    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Number of standard working days in the month (approx 22)
    const totalWorkingDays = 22;

    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'active' },
      include: { department: true },
    });

    const prePayrollList = [];

    for (const emp of employees) {
      const baseSalary = Number(emp.baseSalary) || 0;
      const transportAllowance = Number(emp.transportAllowance) || 0;

      // 1. Fetch employee's clock-ins for the month
      const attendances = await this.prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          clockIn: { gte: start, lte: end },
          clockOut: { not: null },
        },
      });

      // 2. Compute unique presence days
      const presenceDaysSet = new Set<string>();
      const weeklyDurations = new Map<string, number>(); // weekKey -> totalMinutes (weekdays)
      const weeklySundayDurations = new Map<string, number>(); // weekKey -> totalMinutes (sundays)

      for (const att of attendances) {
        const clockInDate = new Date(att.clockIn);
        const dayStr = clockInDate.toISOString().split('T')[0];
        presenceDaysSet.add(dayStr);

        if (!att.clockOut) continue;
        const durationMs = att.clockOut.getTime() - att.clockIn.getTime();
        const durationMin = Math.round(durationMs / (1000 * 60));

        const isSunday = clockInDate.getDay() === 0;
        const weekKey = this.getWeekKey(clockInDate);

        if (isSunday) {
          weeklySundayDurations.set(weekKey, (weeklySundayDurations.get(weekKey) || 0) + durationMin);
        } else {
          weeklyDurations.set(weekKey, (weeklyDurations.get(weekKey) || 0) + durationMin);
        }
      }

      const presenceDays = presenceDaysSet.size;

      // 3. Compute Overtime Brackets
      let ot15Min = 0;
      let ot40Min = 0;
      let ot60Min = 0; // Sundays

      const allWeeks = new Set([...weeklyDurations.keys(), ...weeklySundayDurations.keys()]);
      for (const week of allWeeks) {
        const weekMin = weeklyDurations.get(week) || 0;
        const sunMin = weeklySundayDurations.get(week) || 0;

        const standardLimitMin = 40 * 60; // 40h standard limit per week (2400 mins)

        if (weekMin > standardLimitMin) {
          const overtimeMin = weekMin - standardLimitMin;
          // First 8 hours of overtime (8h = 480 mins) are at 15%, the rest at 40%
          if (overtimeMin <= 8 * 60) {
            ot15Min += overtimeMin;
          } else {
            ot15Min += 8 * 60;
            ot40Min += (overtimeMin - 8 * 60);
          }
        }
        ot60Min += sunMin;
      }

      // Convert to decimal hours
      const ot15Hours = Math.round((ot15Min / 60) * 100) / 100;
      const ot40Hours = Math.round((ot40Min / 60) * 100) / 100;
      const ot60Hours = Math.round((ot60Min / 60) * 100) / 100;

      // 4. Prorate Transport Allowance (standard 20,800 FCFA prorated by presence days)
      const proratedTransport = baseSalary > 0
        ? Math.round((Math.min(presenceDays, totalWorkingDays) / totalWorkingDays) * transportAllowance)
        : 0;

      // 5. Fetch Approved Social Advances/Loans for the month
      const advances = await this.prisma.advanceRequest.findMany({
        where: {
          employeeId: emp.id,
          status: 'approved',
          createdAt: { gte: start, lte: end },
        },
      });

      const totalAdvances = advances.reduce((sum, req) => sum + Number(req.amount), 0);

      // 6. Compute Estimated Financial variables
      // Senegal standard: 173.33 hours per month for salary conversions
      const hourlyRate = baseSalary > 0 ? baseSalary / 173.33 : 0;
      const overtimePay =
        (ot15Hours * hourlyRate * 1.15) +
        (ot40Hours * hourlyRate * 1.40) +
        (ot60Hours * hourlyRate * 1.60);

      const netSalaryEstimate = Math.max(
        0,
        Math.round(baseSalary + overtimePay + proratedTransport - totalAdvances),
      );

      prePayrollList.push({
        employee_id: emp.id,
        first_name: emp.firstName,
        last_name: emp.lastName,
        email: emp.email,
        department: emp.department?.name || '—',
        base_salary: baseSalary,
        presence_days: presenceDays,
        overtime_15_hours: ot15Hours,
        overtime_40_hours: ot40Hours,
        overtime_60_hours: ot60Hours,
        overtime_pay: Math.round(overtimePay),
        transport_allowance: proratedTransport,
        advances_deducted: totalAdvances,
        net_salary_estimate: netSalaryEstimate,
      });
    }

    return prePayrollList;
  }

  /**
   * Convert pre-payroll JSON list to CSV content.
   */
  async exportPrePayrollToCsv(companyId: string, monthYear?: string): Promise<string> {
    const list = await this.getPrePayroll(companyId, monthYear);
    const headers = [
      'ID Employe',
      'Prenom',
      'Nom',
      'Email',
      'Departement',
      'Salaire de Base (FCFA)',
      'Jours de Presence',
      'Heures Sup 15% (h)',
      'Heures Sup 40% (h)',
      'Heures Sup 60% (h)',
      'Gain Heures Sup (FCFA)',
      'Indemnite de Transport (FCFA)',
      'Acomptes Deduits (FCFA)',
      'Estimation Net a Payer (FCFA)',
    ];

    const rows = list.map((item) => [
      item.employee_id,
      item.first_name,
      item.last_name,
      item.email,
      item.department,
      item.base_salary,
      item.presence_days,
      item.overtime_15_hours,
      item.overtime_40_hours,
      item.overtime_60_hours,
      item.overtime_pay,
      item.transport_allowance,
      item.advances_deducted,
      item.net_salary_estimate,
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';')),
    ].join('\r\n');

    return csvContent;
  }
}
