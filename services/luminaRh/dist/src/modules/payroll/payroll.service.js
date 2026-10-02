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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const payroll_engine_1 = require("./engine/payroll-engine");
const senegal_constants_1 = require("./engine/senegal-constants");
let PayrollService = class PayrollService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getWeekKey(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const year = d.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
        return `${year}-W${week}`;
    }
    async generatePayrollRun(companyId, month, year, userId) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        let period = await this.prisma.payrollPeriod.findUnique({
            where: {
                companyId_month_year: {
                    companyId,
                    month,
                    year,
                },
            },
        });
        if (period && (period.status === 'VALIDATED' || period.status === 'PAID')) {
            throw new common_1.BadRequestException(`Impossible de recalculer la paie : la période ${month}/${year} est déjà validée ou payée.`);
        }
        if (!period) {
            period = await this.prisma.payrollPeriod.create({
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
        const employees = await this.prisma.employee.findMany({
            where: { companyId, status: 'active' },
            include: {
                department: true,
            },
        });
        if (employees.length === 0) {
            throw new common_1.BadRequestException('Aucun collaborateur actif trouvé pour cette entreprise.');
        }
        let periodTotalGross = 0;
        let periodTotalNet = 0;
        let periodTotalTax = 0;
        let periodTotalEmployeeSocial = 0;
        let periodTotalEmployerSocial = 0;
        let periodTotalCost = 0;
        for (const emp of employees) {
            const baseSalary = Number(emp.baseSalary) || 0;
            const transportAllowance = Number(emp.transportAllowance) || 20800;
            const taxParts = Number(emp.taxParts) || 1.0;
            const isCadre = emp.isCadre || false;
            const attendances = await this.prisma.attendance.findMany({
                where: {
                    employeeId: emp.id,
                    clockIn: { gte: startDate, lte: endDate },
                    clockOut: { not: null },
                },
            });
            const presenceDaysSet = new Set();
            const weeklyDurations = new Map();
            const weeklySundayDurations = new Map();
            for (const att of attendances) {
                const clockInDate = new Date(att.clockIn);
                const dayStr = clockInDate.toISOString().split('T')[0];
                presenceDaysSet.add(dayStr);
                if (!att.clockOut)
                    continue;
                const durationMin = Math.round((att.clockOut.getTime() - att.clockIn.getTime()) / (1000 * 60));
                const isSunday = clockInDate.getDay() === 0;
                const weekKey = this.getWeekKey(clockInDate);
                if (isSunday) {
                    weeklySundayDurations.set(weekKey, (weeklySundayDurations.get(weekKey) || 0) + durationMin);
                }
                else {
                    weeklyDurations.set(weekKey, (weeklyDurations.get(weekKey) || 0) + durationMin);
                }
            }
            const actualPresenceDays = presenceDaysSet.size > 0 ? presenceDaysSet.size : senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS;
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
                const standardLimitMin = 40 * 60;
                if (weekMin > standardLimitMin) {
                    const overtimeMin = weekMin - standardLimitMin;
                    if (overtimeMin <= 8 * 60) {
                        ot15Min += overtimeMin;
                    }
                    else {
                        ot15Min += 8 * 60;
                        ot40Min += overtimeMin - 8 * 60;
                    }
                }
                ot60Min += sunMin;
            }
            const overtimeInput = {
                hours15: Math.round((ot15Min / 60) * 100) / 100,
                hours40: Math.round((ot40Min / 60) * 100) / 100,
                hours60: Math.round((ot60Min / 60) * 100) / 100,
            };
            const advances = await this.prisma.advanceRequest.findMany({
                where: {
                    employeeId: emp.id,
                    status: 'approved',
                    createdAt: { gte: startDate, lte: endDate },
                },
            });
            const advancesDeducted = advances.reduce((sum, a) => sum + Number(a.amount || 0), 0);
            const variables = await this.prisma.payrollVariable.findMany({
                where: {
                    companyId,
                    employeeId: emp.id,
                    month,
                    year,
                },
            });
            const bonuses = variables.map((v) => ({
                id: v.id,
                name: v.name,
                amount: Number(v.amount),
                isTaxable: v.isTaxable,
                isSubjectToSocial: v.isSubjectToSocial,
            }));
            const calculationInput = {
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
                totalWorkingDays: senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS,
                overtime: overtimeInput,
                bonuses,
                advancesDeducted,
            };
            const calculated = payroll_engine_1.SenegalesePayrollEngine.calculate(calculationInput);
            const existingPayslip = await this.prisma.payslip.findUnique({
                where: {
                    periodId_employeeId: {
                        periodId: period.id,
                        employeeId: emp.id,
                    },
                },
            });
            if (existingPayslip) {
                await this.prisma.payslipLine.deleteMany({
                    where: { payslipId: existingPayslip.id },
                });
            }
            const payslip = await this.prisma.payslip.upsert({
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
                    jobTitle: emp.jobTitle || 'Collaborateur',
                    departmentName: emp.department?.name || 'Général',
                    contractType: emp.contractType,
                    isCadre,
                    taxParts,
                    presenceDays: actualPresenceDays,
                    workingDays: senegal_constants_1.SENEGAL_PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS,
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
                    ipresEmployer: calculated.social.ipresRgEmployerAmount +
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
                    jobTitle: emp.jobTitle || 'Collaborateur',
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
                    ipresEmployer: calculated.social.ipresRgEmployerAmount +
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
            if (calculated.lines.length > 0) {
                await this.prisma.payslipLine.createMany({
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
            periodTotalGross += calculated.grossSalaryTotal;
            periodTotalNet += calculated.netPay;
            periodTotalTax += calculated.tax.irMonthly;
            periodTotalEmployeeSocial += calculated.social.totalEmployeeSocial;
            periodTotalEmployerSocial += calculated.social.totalEmployerSocial;
            periodTotalCost += calculated.totalEmployerCost;
        }
        const updatedPeriod = await this.prisma.payrollPeriod.update({
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
    async getPayrollPeriods(companyId) {
        const periods = await this.prisma.payrollPeriod.findMany({
            where: { companyId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
        return periods.map((p) => this.formatPeriod(p));
    }
    async getPayrollPeriod(companyId, periodId) {
        const period = await this.prisma.payrollPeriod.findFirst({
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
            throw new common_1.NotFoundException('Période de paie introuvable');
        }
        return this.formatPeriod(period);
    }
    async getPayslip(companyId, payslipId) {
        const payslip = await this.prisma.payslip.findFirst({
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
            throw new common_1.NotFoundException('Bulletin de paie introuvable');
        }
        return this.formatPayslip(payslip);
    }
    formatPayslip(p) {
        if (!p)
            return p;
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
        const lines = (p.lines || []).map((l) => ({
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
    formatPeriod(period) {
        if (!period)
            return period;
        const payslips = (period.payslips || []).map((p) => this.formatPayslip(p));
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
    async addVariable(companyId, employeeId, month, year, dto) {
        return this.prisma.payrollVariable.create({
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
    async validatePeriod(companyId, periodId, userId) {
        const period = await this.getPayrollPeriod(companyId, periodId);
        if (period.status === 'VALIDATED' || period.status === 'PAID') {
            throw new common_1.BadRequestException('Cette période est déjà validée.');
        }
        await this.prisma.payrollPeriod.update({
            where: { id: periodId },
            data: {
                status: 'VALIDATED',
                validatedAt: new Date(),
                validatedBy: userId,
            },
        });
        return this.getPayrollPeriod(companyId, periodId);
    }
    async markPeriodAsPaid(companyId, periodId) {
        const period = await this.getPayrollPeriod(companyId, periodId);
        if (period.status !== 'VALIDATED') {
            throw new common_1.BadRequestException('La période doit d\'abord être validée avant d\'être marquée comme payée.');
        }
        await this.prisma.payslip.updateMany({
            where: { periodId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });
        await this.prisma.payrollPeriod.update({
            where: { id: periodId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });
        return this.getPayrollPeriod(companyId, periodId);
    }
    async exportBankTransfer(companyId, periodId) {
        const period = await this.getPayrollPeriod(companyId, periodId);
        const headers = [
            'Matricule',
            'Nom Collaborateur',
            'Banque',
            'RIB / IBAN',
            'Montant Net (FCFA)',
            'Motif du Virement',
        ];
        const rows = period.payslips.map((p) => [
            p.employeeId,
            p.employeeName,
            'Banque Standard',
            'SN58 0000 0000 0000 0000 00',
            p.netSalary,
            `Virement Salaire ${period.month}/${period.year}`,
        ]);
        const csv = [
            headers.join(';'),
            ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')),
        ].join('\r\n');
        return csv;
    }
    async exportMobileMoney(companyId, periodId) {
        const period = await this.getPayrollPeriod(companyId, periodId);
        const headers = ['Telephone', 'Montant', 'Prenom', 'Nom', 'Ref'];
        const rows = period.payslips.map((p) => {
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
            ...rows.map((r) => r.join(',')),
        ].join('\r\n');
        return csv;
    }
    async getPrePayroll(companyId, monthYear) {
        const now = new Date();
        const currentMonth = monthYear
            ? parseInt(monthYear.split('-')[0])
            : now.getMonth() + 1;
        const currentYear = monthYear
            ? parseInt(monthYear.split('-')[1])
            : now.getFullYear();
        const period = await this.generatePayrollRun(companyId, currentMonth, currentYear);
        return period.payslips.map((p) => ({
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
    async exportPrePayrollToCsv(companyId, monthYear) {
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
        const rows = list.map((item) => [
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
            ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';')),
        ].join('\r\n');
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map