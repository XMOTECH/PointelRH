import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      employee: { findMany: jest.fn() },
      attendance: { findMany: jest.fn() },
      advanceRequest: { findMany: jest.fn() },
      payrollPeriod: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      payslip: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        upsert: jest.fn(),
        updateMany: jest.fn(),
      },
      payslipLine: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      payrollVariable: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePayrollRun & getPrePayroll', () => {
    it('should generate payroll period and calculate payslips accurately', async () => {
      const mockEmployee = {
        id: 'emp-1',
        firstName: 'Fatou',
        lastName: 'Ndiaye',
        email: 'fatou@example.com',
        baseSalary: 300000,
        transportAllowance: 20800,
        taxParts: 2.0,
        status: 'active',
        contractType: 'cdi',
        department: { name: 'Comptabilité' },
      };

      prisma.payrollPeriod.findUnique.mockResolvedValue(null);
      prisma.payrollPeriod.create.mockResolvedValue({
        id: 'period-1',
        companyId: 'company-1',
        month: 6,
        year: 2026,
        status: 'DRAFT',
      });
      prisma.employee.findMany.mockResolvedValue([mockEmployee]);
      prisma.attendance.findMany.mockResolvedValue([
        {
          clockIn: new Date('2026-06-01T08:00:00Z'),
          clockOut: new Date('2026-06-01T17:00:00Z'),
        },
      ]);
      prisma.advanceRequest.findMany.mockResolvedValue([
        { amount: 50000, status: 'approved' },
      ]);
      prisma.payrollVariable.findMany.mockResolvedValue([]);
      prisma.payslip.findUnique.mockResolvedValue(null);
      prisma.payslip.upsert.mockResolvedValue({
        id: 'slip-1',
        employeeId: 'emp-1',
        employeeName: 'Fatou Ndiaye',
        employeeEmail: 'fatou@example.com',
        baseSalary: 300000,
        transportAllowance: 20800,
        overtimePay: 0,
        advancesDeducted: 50000,
        netSalary: 230000,
      });
      prisma.payslipLine.createMany.mockResolvedValue({ count: 10 });
      prisma.payrollPeriod.update.mockResolvedValue({
        id: 'period-1',
        status: 'CALCULATED',
        totalGross: 320800,
        totalNet: 230000,
        payslips: [
          {
            id: 'slip-1',
            employeeId: 'emp-1',
            employeeName: 'Fatou Ndiaye',
            employeeEmail: 'fatou@example.com',
            departmentName: 'Comptabilité',
            baseSalary: 300000,
            transportAllowance: 20800,
            overtimePay: 0,
            advancesDeducted: 50000,
            netSalary: 230000,
            presenceDays: 1,
          },
        ],
      });

      const result = await service.getPrePayroll('company-1', '06-2026');

      expect(result).toHaveLength(1);
      const payroll = result[0];
      expect(payroll.first_name).toBe('Fatou');
      expect(payroll.base_salary).toBe(300000);
      expect(payroll.advances_deducted).toBe(50000);
      expect(payroll.net_salary_estimate).toBeGreaterThan(0);
    });
  });
});
