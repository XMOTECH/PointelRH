import { Test, TestingModule } from '@nestjs/testing';
import { PlanningWeekService } from './planning-week.service';
import { PlanningComplianceService } from './planning-compliance.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PlanningWeekService', () => {
  let service: PlanningWeekService;
  let prisma: any;
  let complianceService: any;

  beforeEach(async () => {
    prisma = {
      planningWeek: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      employee: {
        findMany: jest.fn(),
      },
      shift: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      leaveRequest: {
        findMany: jest.fn(),
      },
      missionAssignment: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn((promises) => Promise.all(promises)),
    };

    complianceService = {
      calculateNetMinutes: jest.fn((start, end, brk) => 480), // 8h net
      evaluateWeeklyCompliance: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningWeekService,
        { provide: PrismaService, useValue: prisma },
        { provide: PlanningComplianceService, useValue: complianceService },
      ],
    }).compile();

    service = module.get<PlanningWeekService>(PlanningWeekService);
  });

  describe('normalizeWeekBounds', () => {
    it('doit normaliser correctement le lundi et le dimanche pour un jour en milieu de semaine', () => {
      // Mercredi 7 octobre 2026 -> Lundi = 5 octobre 2026, Dimanche = 11 octobre 2026
      const bounds = service.normalizeWeekBounds('2026-10-07');
      expect(bounds.weekStartStr).toBe('2026-10-05');
      expect(bounds.weekEndStr).toBe('2026-10-11');
      expect(bounds.weekStart.getUTCDay()).toBe(1); // Lundi
      expect(bounds.weekEnd.getUTCDay()).toBe(0); // Dimanche
    });

    it('doit normaliser correctement pour un dimanche', () => {
      // Dimanche 11 octobre 2026 -> Lundi de la même semaine = 5 octobre 2026
      const bounds = service.normalizeWeekBounds('2026-10-11');
      expect(bounds.weekStartStr).toBe('2026-10-05');
      expect(bounds.weekEndStr).toBe('2026-10-11');
    });
  });

  describe('publishWeek', () => {
    it('doit passer la semaine et tous ses shifts à PUBLISHED', async () => {
      prisma.planningWeek.findFirst.mockResolvedValue({
        id: 'week-1',
        status: 'DRAFT',
      });
      prisma.planningWeek.update.mockResolvedValue({
        id: 'week-1',
        status: 'PUBLISHED',
      });
      prisma.shift.updateMany.mockResolvedValue({ count: 12 });

      const result = await service.publishWeek('comp-1', '2026-10-05', 'user-admin');

      expect(result.success).toBe(true);
      expect(prisma.planningWeek.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED', publishedBy: 'user-admin' }),
        }),
      );
      expect(prisma.shift.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'PUBLISHED' },
        }),
      );
    });
  });

  describe('duplicateWeek', () => {
    it('doit copier les shifts de la semaine source vers la semaine cible avec décalage de dates', async () => {
      prisma.shift.findMany.mockResolvedValue([
        {
          id: 'shift-1',
          employeeId: 'emp-1',
          date: new Date('2026-10-05T00:00:00Z'), // Lundi S1
          startTime: '08:00',
          endTime: '17:00',
          breakMinutes: 60,
          status: 'PUBLISHED',
        },
      ]);

      prisma.planningWeek.findFirst.mockResolvedValue({
        id: 'target-week-id',
        status: 'DRAFT',
      });

      prisma.shift.createMany.mockResolvedValue({ count: 1 });

      const result = await service.duplicateWeek(
        'comp-1',
        {
          sourceWeekStart: '2026-10-05',
          targetWeekStart: '2026-10-12', // +7 jours
        },
        'user-admin',
      );

      expect(result.success).toBe(true);
      expect(result.duplicatedCount).toBe(1);
      expect(prisma.shift.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              date: new Date('2026-10-12T00:00:00.000Z'),
              status: 'DRAFT', // Commence toujours en DRAFT
            }),
          ]),
        }),
      );
    });
  });
});
