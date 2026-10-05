import { Test, TestingModule } from '@nestjs/testing';
import { PlanningComplianceService } from './planning-compliance.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PlanningComplianceService', () => {
  let service: PlanningComplianceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      shift: {
        findMany: jest.fn(),
      },
      leaveRequest: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningComplianceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PlanningComplianceService>(PlanningComplianceService);
  });

  describe('Calculs temporels', () => {
    it('doit convertir correctement HH:mm en minutes', () => {
      expect(service.timeToMinutes('00:00')).toBe(0);
      expect(service.timeToMinutes('08:30')).toBe(510);
      expect(service.timeToMinutes('23:59')).toBe(1439);
    });

    it('doit calculer la durée brute standard', () => {
      expect(service.calculateGrossMinutes('08:00', '16:30')).toBe(510); // 8h30 = 510m
    });

    it('doit calculer la durée brute d\'un shift de nuit chevauchant minuit', () => {
      // 22h00 -> 06h00 = 2h avant minuit + 6h après = 8h = 480m
      expect(service.calculateGrossMinutes('22:00', '06:00')).toBe(480);
    });

    it('doit calculer la durée nette en soustrayant la pause', () => {
      // 08:00 -> 17:00 (9h = 540m) - 60m pause = 480m (8h)
      expect(service.calculateNetMinutes('08:00', '17:00', 60)).toBe(480);
    });

    it('doit détecter correctement les chevauchements horaires', () => {
      // Shift A: 08:00 - 12:00, Shift B: 11:00 - 15:00 -> Chevauchement
      expect(service.doShiftsOverlap(
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '11:00', endTime: '15:00' },
      )).toBe(true);

      // Shift A: 08:00 - 12:00, Shift B: 12:00 - 16:00 -> Pas de chevauchement strict
      expect(service.doShiftsOverlap(
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '12:00', endTime: '16:00' },
      )).toBe(false);
    });

    it('doit calculer le repos consécutif entre deux journées', () => {
      // Fin veille: 18h00, Début lendemain: 08h00 -> Repos = 6h + 8h = 14h (840m) >= 11h
      expect(service.calculateRestMinutesBetweenDays('18:00', '08:00')).toBe(840);

      // Fin veille: 23h00, Début lendemain: 07h00 -> Repos = 1h + 7h = 8h (480m) < 11h (660m)
      expect(service.calculateRestMinutesBetweenDays('23:00', '07:00')).toBe(480);
    });
  });

  describe('Validation d\'un shift unique (validateSingleShift)', () => {
    it('doit lever une violation si le collaborateur est en congé validé', async () => {
      prisma.leaveRequest.findFirst.mockResolvedValue({
        id: 'leave-1',
        leaveType: { name: 'Congé Payé' },
      });
      prisma.shift.findMany.mockResolvedValue([]);

      const violations = await service.validateSingleShift('comp-1', {
        employeeId: 'emp-1',
        date: '2026-10-05',
        startTime: '08:00',
        endTime: '16:00',
      });

      expect(violations).toHaveLength(1);
      expect(violations[0].rule).toBe('LEAVE_CONFLICT');
      expect(violations[0].severity).toBe('ERROR');
    });

    it('doit lever une violation si le repos quotidien est inférieur à 11h', async () => {
      prisma.leaveRequest.findFirst.mockResolvedValue(null);
      // Shift de la veille terminant à 23h
      prisma.shift.findMany.mockResolvedValue([
        {
          id: 'prev-shift',
          date: new Date('2026-10-04T00:00:00Z'),
          startTime: '15:00',
          endTime: '23:00',
        },
      ]);

      const violations = await service.validateSingleShift('comp-1', {
        employeeId: 'emp-1',
        date: '2026-10-05',
        startTime: '07:00', // 8h de repos seulement
        endTime: '15:00',
      });

      const restViolation = violations.find((v) => v.rule === 'DAILY_REST_INSUFFICIENT');
      expect(restViolation).toBeDefined();
      expect(restViolation?.severity).toBe('WARNING');
    });

    it('doit lever une alerte si la durée journalière dépasse 10h nettes', async () => {
      prisma.leaveRequest.findFirst.mockResolvedValue(null);
      prisma.shift.findMany.mockResolvedValue([]);

      // 07:00 à 19:30 (12h30) - 30m pause = 12h nettes > 10h
      const violations = await service.validateSingleShift('comp-1', {
        employeeId: 'emp-1',
        date: '2026-10-05',
        startTime: '07:00',
        endTime: '19:30',
        breakMinutes: 30,
      });

      const dailyLimitViolation = violations.find((v) => v.rule === 'MAX_DAILY_HOURS');
      expect(dailyLimitViolation).toBeDefined();
    });
  });
});
