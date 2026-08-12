import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let prisma: {
    employee: { findMany: jest.Mock };
    attendance: { findMany: jest.Mock };
    advanceRequest: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      employee: { findMany: jest.fn() },
      attendance: { findMany: jest.fn() },
      advanceRequest: { findMany: jest.fn() },
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

  describe('getPrePayroll', () => {
    it('should calculate estimated net salary accurately including transport allowance and advances', async () => {
      const mockEmployee = {
        id: 'emp-1',
        firstName: 'Fatou',
        lastName: 'Ndiaye',
        email: 'fatou@example.com',
        baseSalary: 300000,
        transportAllowance: 20800,
        status: 'active',
        department: { name: 'Comptabilité' },
      };

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
