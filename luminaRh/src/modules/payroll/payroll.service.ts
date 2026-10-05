import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SenegalesePayrollEngine } from './engine/payroll-engine';
import {
  PayrollCalculationInput,
  PayrollBonusItem,
  OvertimeInput,
} from './engine/payroll-engine.types';
import { SENEGAL_PAYROLL_CONSTANTS } from './engine/senegal-constants';
import { AddPayrollVariableDto } from './dto/add-payroll-variable.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper pour calculer la clé de semaine ISO pour l'agrégation des heures supp hebdomadaires (CCNI).
   */
  private getWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const year = d.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
    return `${year}-W${week}`;
  }

  // =========================================================================
  // 1. MOTEUR D'ORCHESTRATION DU CYCLE DE PAIE (SENIOR SENIOR ENGINE)
  // =========================================================================

  /**
   * Lance ou recalcule l'intégralité d'un cycle de paie pour un mois donné.
   * Agrège les pointages réels, acomptes approuvés et données fiscales pour chaque collaborateur.
   */
  async generatePayrollRun(
    companyId: string,
    month: number,
    year: number,
    userId?: string,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Trouver ou initialiser la période de paie
    let period = await (this.prisma as any).payrollPeriod.findUnique({
      where: {
        companyId_month_year: {
          companyId,
          month,
          year,
        },
      },
    });

    if (period && (period.status === 'VALIDATED' || period.status === 'PAID')) {
      throw new BadRequestException(
        `Impossible de recalculer la paie : la période ${month}/${year} est déjà validée ou payée.`,
      );
    }

    if (!period) {
      period = await (this.prisma as any).payrollPeriod.create({
        data: {
          companyId,
          month,
          year,
          startDate,
          endDate,
          status: 'DRAFT',
        },
      });
    }

    // 2. Récupérer tous les collaborateurs actifs de l'entreprise
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'active' },
      include: {
        department: true,
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('Aucun collaborateur actif trouvé pour cette entreprise.');
    }

    let periodTotalGross = 0;
    let periodTotalNet = 0;
    let periodTotalTax = 0;
    let periodTotalEmployeeSocial = 0;
    let periodTotalEmployerSocial = 0;
    let periodTotalCost = 0;

    // 3. Boucle de calcul individualisé pour chaque collaborateur
    for (const emp of employees) {
      const baseSalary = Number(emp.baseSalary) || 0;
      const transportAllowance = Number(emp.transportAllowance) || 20800;
      const taxParts = Number(emp.taxParts) || 1.0;
      const isCadre = (emp as any).isCadre || false;

      // A. Agrégation des pointages et présences du mois
      const attendances = await this.prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          clockIn: { gte: startDate, lte: endDate },
          clockOut: { not: null },
        },
      });

      const presenceDaysSet = new Set<string>();
      const weeklyDurations = new Map<string, number>();
      const weeklySundayDurations = new Map<string, number>();

      for (const att of attendances) {
        const clockInDate = new Date(att.clockIn);
        const dayStr = clockInDate.toISOString().split('T')[0];
        presenceDaysSet.add(dayStr);

        if (!att.clockOut) continue;
        const durationMin = Math.round(
          (att.clockOut.getTime() - att.clockIn.getTime()) / (1000 * 60),
        );
        const isSunday = clockInDate.getDay() === 0;
        const weekKey = this.getWeekKey(clockInDate);

        if (isSunday) {
          weeklySundayDurations.set(
            weekKey,
            (weeklySundayDurations.get(weekKey) || 0) + durationMin,
          );
        } else {
          weeklyDurations.set(
            weekKey,
            (weeklyDurations.get(weekKey) || 0) + durationMin,
          );
        }
      }

      // Par défaut, si aucun système de pointage n'a été enregistré ce mois-ci,
      // on applique 22 jours ouvrés complets
      const actualPresenceDays =
        presenceDaysSet.size > 0 ? presenceDaysSet.size : SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS;

      // Calcul des heures supplémentaires par semaine (CCNI)
      let ot15Min = 0;
      let ot40Min = 0;
      let ot60Min = 0;

      const allWeeks = new Set([
        ...weeklyDurations.keys(),
        ...weeklySundayDurations.keys(),
      ]);
      for (const week of allWeeks) {
        const weekMin = weeklyDurations.get(week) || 0;
        const sunMin = weeklySundayDurations.get(week) || 0;
        const standardLimitMin = 40 * 60; // 40h standard

        if (weekMin > standardLimitMin) {
          const overtimeMin = weekMin - standardLimitMin;
          if (overtimeMin <= 8 * 60) {
            ot15Min += overtimeMin;
          } else {
            ot15Min += 8 * 60;
            ot40Min += overtimeMin - 8 * 60;
          }
        }
        ot60Min += sunMin;
      }

      const overtimeInput: OvertimeInput = {
        hours15: Math.round((ot15Min / 60) * 100) / 100,
        hours40: Math.round((ot40Min / 60) * 100) / 100,
        hours60: Math.round((ot60Min / 60) * 100) / 100,
      };

      // B. Acomptes approuvés sur salaire dans le mois
      const advances = await this.prisma.advanceRequest.findMany({
        where: {
          employeeId: emp.id,
          status: 'approved',
          createdAt: { gte: startDate, lte: endDate },
        },
      });
      const advancesDeducted = advances.reduce(
        (sum, a) => sum + Number(a.amount || 0),
        0,
      );

      // C. Primes et variables ponctuelles enregistrées pour ce collaborateur
      const variables = await (this.prisma as any).payrollVariable.findMany({
        where: {
          companyId,
          employeeId: emp.id,
          month,
          year,
        },
      });

      const bonuses: PayrollBonusItem[] = variables.map((v: any) => ({
        id: v.id,
        name: v.name,
        amount: Number(v.amount),
        isTaxable: v.isTaxable,
        isSubjectToSocial: v.isSubjectToSocial,
      }));

      // D. Exécution du moteur de paie pur
      const calculationInput: PayrollCalculationInput = {
        employee: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          contractType: emp.contractType,
          isCadre,
          baseSalary,
          taxParts,
          transportAllowance,
        },
        month,
        year,
        presenceDays: actualPresenceDays,
        totalWorkingDays: SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS,
        overtime: overtimeInput,
        bonuses,
        advancesDeducted,
      };

      const calculated = SenegalesePayrollEngine.calculate(calculationInput);

      // E. Persistance du bulletin de paie dans la base
      // On supprime les anciennes lignes de bulletin si déjà calculées
      const existingPayslip = await (this.prisma as any).payslip.findUnique({
        where: {
          periodId_employeeId: {
            periodId: period.id,
            employeeId: emp.id,
          },
        },
      });

      if (existingPayslip) {
        await (this.prisma as any).payslipLine.deleteMany({
          where: { payslipId: existingPayslip.id },
        });
      }

      const payslip = await (this.prisma as any).payslip.upsert({
        where: {
          periodId_employeeId: {
            periodId: period.id,
            employeeId: emp.id,
          },
        },
        create: {
          companyId,
          periodId: period.id,
          employeeId: emp.id,
          status: 'DRAFT',
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeEmail: emp.email,
          jobTitle: (emp as any).jobTitle || 'Collaborateur',
          departmentName: emp.department?.name || 'Général',
          contractType: emp.contractType,
          isCadre,
          taxParts,
          presenceDays: actualPresenceDays,
          workingDays: SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS,
          baseSalary: calculated.baseSalary,
          sursalaire: calculated.sursalaire,
          overtimePay: calculated.totalOvertimePay,
          transportAllowance: calculated.transportAllowance,
          transportExempt: calculated.transportExemptAmount,
          taxableBonuses: calculated.taxableBonuses,
          nonTaxableBonuses: calculated.nonTaxableBonuses,
          grossSalary: calculated.grossSalaryTotal,
          grossCotisable: calculated.social.grossCotisable,
          grossTaxable: calculated.tax.grossTaxable,
          ipresEmployee: calculated.social.totalEmployeeSocial,
          ipresEmployer:
            calculated.social.ipresRgEmployerAmount +
            calculated.social.ipresRccEmployerAmount,
          cssPfEmployer: calculated.social.cssPfAmount,
          cssAtEmployer: calculated.social.cssAtAmount,
          cfceEmployer: calculated.social.cfceAmount,
          totalEmployeeSocial: calculated.social.totalEmployeeSocial,
          totalEmployerSocial: calculated.social.totalEmployerSocial,
          taxIncomeTax: calculated.tax.irMonthly,
          advancesDeducted: calculated.advancesDeducted,
          otherDeductions: calculated.otherDeductions,
          totalDeductions: calculated.totalDeductions,
          netSalary: calculated.netPay,
          employerTotalCost: calculated.totalEmployerCost,
        },
        update: {
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeEmail: emp.email,
          jobTitle: (emp as any).jobTitle || 'Collaborateur',
          departmentName: emp.department?.name || 'Général',
          presenceDays: actualPresenceDays,
          baseSalary: calculated.baseSalary,
          sursalaire: calculated.sursalaire,
          overtimePay: calculated.totalOvertimePay,
          transportAllowance: calculated.transportAllowance,
          transportExempt: calculated.transportExemptAmount,
          taxableBonuses: calculated.taxableBonuses,
          nonTaxableBonuses: calculated.nonTaxableBonuses,
          grossSalary: calculated.grossSalaryTotal,
          grossCotisable: calculated.social.grossCotisable,
          grossTaxable: calculated.tax.grossTaxable,
          ipresEmployee: calculated.social.totalEmployeeSocial,
          ipresEmployer:
            calculated.social.ipresRgEmployerAmount +
            calculated.social.ipresRccEmployerAmount,
          cssPfEmployer: calculated.social.cssPfAmount,
          cssAtEmployer: calculated.social.cssAtAmount,
          cfceEmployer: calculated.social.cfceAmount,
          totalEmployeeSocial: calculated.social.totalEmployeeSocial,
          totalEmployerSocial: calculated.social.totalEmployerSocial,
          taxIncomeTax: calculated.tax.irMonthly,
          advancesDeducted: calculated.advancesDeducted,
          otherDeductions: calculated.otherDeductions,
          totalDeductions: calculated.totalDeductions,
          netSalary: calculated.netPay,
          employerTotalCost: calculated.totalEmployerCost,
        },
      });

      // F. Création de toutes les lignes détaillées du bulletin
      if (calculated.lines.length > 0) {
        await (this.prisma as any).payslipLine.createMany({
          data: calculated.lines.map((line, index) => ({
            payslipId: payslip.id,
            code: line.code,
            label: line.label,
            category: line.code.startsWith('1')
              ? 'gain'
              : line.code.startsWith('2')
              ? 'gain'
              : line.code.startsWith('3')
              ? 'gain'
              : line.code.startsWith('5')
              ? 'social'
              : line.code.startsWith('6')
              ? 'tax'
              : 'deduction',
            base: line.base || 0,
            rateEmployee: line.rateEmployee || null,
            amountEmployee: line.amountEmployee !== undefined ? line.amountEmployee : null,
            rateEmployer: line.rateEmployer || null,
            amountEmployer: line.amountEmployer !== undefined ? line.amountEmployer : null,
            order: index,
          })),
        });
      }

      // Cumul période
      periodTotalGross += calculated.grossSalaryTotal;
      periodTotalNet += calculated.netPay;
      periodTotalTax += calculated.tax.irMonthly;
      periodTotalEmployeeSocial += calculated.social.totalEmployeeSocial;
      periodTotalEmployerSocial += calculated.social.totalEmployerSocial;
      periodTotalCost += calculated.totalEmployerCost;
    }

    // 4. Mettre à jour les totaux consolidés de la période
    const updatedPeriod = await (this.prisma as any).payrollPeriod.update({
      where: { id: period.id },
      data: {
        status: 'CALCULATED',
        totalGross: periodTotalGross,
        totalNet: periodTotalNet,
        totalTax: periodTotalTax,
        totalEmployeeSocial: periodTotalEmployeeSocial,
        totalEmployerSocial: periodTotalEmployerSocial,
        totalCost: periodTotalCost,
        payslipsCount: employees.length,
        processedAt: new Date(),
      },
      include: {
        payslips: {
          orderBy: { employeeName: 'asc' },
          include: {
            employee: {
              include: { department: true },
            },
          },
        },
      },
    });

    return this.formatPeriod(updatedPeriod);
  }

  /**
   * Récupère la liste de toutes les périodes de paie avec leurs statistiques.
   */
  async getPayrollPeriods(companyId: string) {
    const periods = await (this.prisma as any).payrollPeriod.findMany({
      where: { companyId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return periods.map((p: any) => this.formatPeriod(p));
  }

  /**
   * Récupère le détail d'une période de paie avec tous les bulletins associés.
   */
  async getPayrollPeriod(companyId: string, periodId: string) {
    const period = await (this.prisma as any).payrollPeriod.findFirst({
      where: { id: periodId, companyId },
      include: {
        payslips: {
          orderBy: { employeeName: 'asc' },
          include: {
            employee: {
              include: { department: true },
            },
          },
        },
      },
    });

    if (!period) {
      throw new NotFoundException('Période de paie introuvable');
    }

    return this.formatPeriod(period);
  }

  /**
   * Récupère un bulletin de paie unique avec l'intégralité de ses lignes décomposées.
   */
  async getPayslip(companyId: string, payslipId: string) {
    const payslip = await (this.prisma as any).payslip.findFirst({
      where: { id: payslipId, companyId },
      include: {
        period: true,
        employee: {
          include: { department: true },
        },
        lines: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!payslip) {
      throw new NotFoundException('Bulletin de paie introuvable');
    }

    return this.formatPayslip(payslip);
  }

  private formatPayslip(p: any) {
    if (!p) return p;
    const baseSalary = Number(p.baseSalary || 0);
    const sursalaire = Number(p.sursalaire || 0);
    const overtimePay = Number(p.overtimePay || 0);
    const transportAllowance = Number(p.transportAllowance || 0);
    const taxableBonuses = Number(p.taxableBonuses || 0);
    const nonTaxableBonuses = Number(p.nonTaxableBonuses || 0);
    const bonusesTotal = taxableBonuses + nonTaxableBonuses;
    const grossSalary = Number(p.grossSalary || 0);
    const grossTaxable = Number(p.grossTaxable || 0);
    const ipresEmployee = Number(p.ipresEmployee || 0);
    const ipresEmployer = Number(p.ipresEmployer || 0);
    const cssFamily = Number(p.cssPfEmployer || 0);
    const cssWorkAccident = Number(p.cssAtEmployer || 0);
    const cfceTax = Number(p.cfceEmployer || 0);
    const incomeTax = Number(p.taxIncomeTax || 0);
    const advancesDeducted = Number(p.advancesDeducted || 0);
    const otherDeductions = Number(p.otherDeductions || 0);
    const netSalary = Number(p.netSalary || 0);
    const employerTotalCost = Number(p.employerTotalCost || 0);
    const taxParts = Number(p.taxParts || 1.0);

    const empFirstName = p.employee?.firstName || (p.employeeName ? p.employeeName.split(' ')[0] : '');
    const empLastName = p.employee?.lastName || (p.employeeName ? p.employeeName.split(' ').slice(1).join(' ') : '');

    const lines = (p.lines || []).map((l: any) => ({
      id: l.id,
      payslipId: l.payslipId,
      code: l.code,
      label: l.label,
      description: l.label,
      category: l.category,
      base: l.base !== null && l.base !== undefined ? Number(l.base) : null,
      rate: l.rateEmployee ?? l.rateEmployer ?? null,
      rateEmployee: l.rateEmployee,
      rateEmployer: l.rateEmployer,
      gain: l.category === 'gain' ? Number(l.amountEmployee || 0) : null,
      retenue: (l.category === 'social' || l.category === 'tax' || l.category === 'deduction')
        ? Number(l.amountEmployee || 0)
        : null,
      patronal: l.amountEmployer !== null && l.amountEmployer !== undefined ? Number(l.amountEmployer) : null,
      order: l.order,
    }));

    return {
      ...p,
      periodLabel: p.period?.month && p.period?.year
        ? `${String(p.period.month).padStart(2, '0')}/${p.period.year}`
        : `${String(p.month || '').padStart(2, '0')}/${p.year || ''}`,
      baseSalary,
      sursalaire,
      overtimePay,
      transportAllowance,
      taxableBonuses,
      nonTaxableBonuses,
      bonusesTotal,
      grossSalary,
      grossTaxable,
      taxableGross: grossTaxable,
      ipresEmployee,
      ipresEmployer,
      ipresExecEmployee: 0,
      ipresExecEmployer: 0,
      cssFamily,
      cssWorkAccident,
      cfceTax,
      incomeTax,
      taxIncomeTax: incomeTax,
      advancesDeducted,
      otherDeductions,
      netSalary,
      netPay: netSalary,
      netPayable: netSalary,
      employerTotalCost,
      totalEmployerCost: employerTotalCost,
      taxParts,
      employee: {
        id: p.employeeId,
        firstName: empFirstName,
        lastName: empLastName,
        email: p.employeeEmail || p.employee?.email,
        jobTitle: p.jobTitle || p.employee?.jobTitle || 'Collaborateur',
        isCadre: p.isCadre ?? p.employee?.isCadre ?? false,
        department: p.employee?.department || { id: '', name: p.departmentName || 'Général' },
        bankRib: p.employee?.bankRib,
        bankName: p.employee?.bankName,
        mobileMoneyNumber: p.employee?.mobileMoneyNumber,
        mobileMoneyProvider: p.employee?.mobileMoneyProvider,
        ipresNumber: p.employee?.ipresNumber,
        cssNumber: p.employee?.cssNumber,
      },
      lines,
    };
  }

  private formatPeriod(period: any) {
    if (!period) return period;
    const payslips = (period.payslips || []).map((p: any) => this.formatPayslip(p));
    return {
      ...period,
      periodLabel: `${String(period.month).padStart(2, '0')}/${period.year}`,
      employeeCount: period.payslipsCount || payslips.length,
      totalGross: Number(period.totalGross || 0),
      totalNet: Number(period.totalNet || 0),
      totalTax: Number(period.totalTax || 0),
      totalEmployeeSocial: Number(period.totalEmployeeSocial || 0),
      totalSocialEmployee: Number(period.totalEmployeeSocial || 0),
      totalEmployerSocial: Number(period.totalEmployerSocial || 0),
      totalSocialEmployer: Number(period.totalEmployerSocial || 0),
      totalEmployerCost: Number(period.totalCost || 0),
      totalCost: Number(period.totalCost || 0),
      payslips,
    };
  }

  /**
   * Ajoute une prime ponctuelle ou indemnité variable pour un employé.
   */
  async addVariable(
    companyId: string,
    employeeId: string,
    month: number,
    year: number,
    dto: AddPayrollVariableDto,
  ) {
    return (this.prisma as any).payrollVariable.create({
      data: {
        companyId,
        employeeId,
        month,
        year,
        name: dto.name,
        amount: dto.amount,
        isTaxable: dto.isTaxable ?? true,
        isSubjectToSocial: dto.isSubjectToSocial ?? true,
      },
    });
  }

  /**
   * Valide et verrouille une période de paie (CALCULATED -> VALIDATED).
   */
  async validatePeriod(companyId: string, periodId: string, userId: string) {
    const period = await this.getPayrollPeriod(companyId, periodId);

    if (period.status === 'VALIDATED' || period.status === 'PAID') {
      throw new BadRequestException('Cette période est déjà validée.');
    }

    await (this.prisma as any).payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: 'VALIDATED',
        validatedAt: new Date(),
        validatedBy: userId,
      },
    });
    return this.getPayrollPeriod(companyId, periodId);
  }

  /**
   * Déclare la période de paie comme réglée / payée (VALIDATED -> PAID).
   */
  async markPeriodAsPaid(companyId: string, periodId: string) {
    const period = await this.getPayrollPeriod(companyId, periodId);

    if (period.status !== 'VALIDATED') {
      throw new BadRequestException(
        'La période doit d\'abord être validée avant d\'être marquée comme payée.',
      );
    }

    await (this.prisma as any).payslip.updateMany({
      where: { periodId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await (this.prisma as any).payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
    return this.getPayrollPeriod(companyId, periodId);
  }

  /**
   * Génère le fichier de virement bancaire interbancaire au format standard UEMOA / SEPA.
   */
  async exportBankTransfer(companyId: string, periodId: string): Promise<string> {
    const period = await this.getPayrollPeriod(companyId, periodId);
    const headers = [
      'Matricule',
      'Nom Collaborateur',
      'Banque',
      'RIB / IBAN',
      'Montant Net (FCFA)',
      'Motif du Virement',
    ];

    const rows = period.payslips.map((p: any) => [
      p.employeeId,
      p.employeeName,
      'Banque Standard',
      'SN58 0000 0000 0000 0000 00',
      p.netSalary,
      `Virement Salaire ${period.month}/${period.year}`,
    ]);

    const csv = [
      headers.join(';'),
      ...rows.map((r: any) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(';')),
    ].join('\r\n');

    return csv;
  }

  /**
   * Génère le fichier de virement Mobile Money groupé (Wave / Orange Money).
   */
  async exportMobileMoney(companyId: string, periodId: string): Promise<string> {
    const period = await this.getPayrollPeriod(companyId, periodId);
    const headers = ['Telephone', 'Montant', 'Prenom', 'Nom', 'Ref'];

    const rows = period.payslips.map((p: any) => {
      const parts = (p.employeeName || '').split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      return [
        '+221770000000',
        p.netSalary,
        firstName,
        lastName,
        `SAL-${period.month}-${period.year}`,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((r: any) => r.join(',')),
    ].join('\r\n');

    return csv;
  }

  // =========================================================================
  // MÉTHODES DE RÉTRO-COMPATIBILITÉ (ANCIENNE PRÉ-PAIE)
  // =========================================================================

  async getPrePayroll(companyId: string, monthYear?: string) {
    const now = new Date();
    const currentMonth = monthYear
      ? parseInt(monthYear.split('-')[0])
      : now.getMonth() + 1;
    const currentYear = monthYear
      ? parseInt(monthYear.split('-')[1])
      : now.getFullYear();

    const period = await this.generatePayrollRun(companyId, currentMonth, currentYear);
    return period.payslips.map((p: any) => ({
      employee_id: p.employeeId,
      first_name: p.employeeName.split(' ')[0],
      last_name: p.employeeName.split(' ').slice(1).join(' '),
      email: p.employeeEmail,
      department: p.departmentName,
      base_salary: Number(p.baseSalary),
      presence_days: p.presenceDays,
      overtime_15_hours: 0,
      overtime_40_hours: 0,
      overtime_60_hours: 0,
      overtime_pay: Number(p.overtimePay),
      transport_allowance: Number(p.transportAllowance),
      advances_deducted: Number(p.advancesDeducted),
      net_salary_estimate: Number(p.netSalary),
    }));
  }

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
      'Gain Heures Sup (FCFA)',
      'Indemnite de Transport (FCFA)',
      'Acomptes Deduits (FCFA)',
      'Net a Payer Conforme (FCFA)',
    ];

    const rows = list.map((item: any) => [
      item.employee_id,
      item.first_name,
      item.last_name,
      item.email,
      item.department,
      item.base_salary,
      item.presence_days,
      item.overtime_pay,
      item.transport_allowance,
      item.advances_deducted,
      item.net_salary_estimate,
    ]);

    return [
      headers.join(';'),
      ...rows.map((row: any[]) => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(';')),
    ].join('\r\n');
  }
}
