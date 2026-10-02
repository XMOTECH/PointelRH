import { Test, TestingModule } from '@nestjs/testing';
import { PointageService } from './pointage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('PointageService', () => {
  let service: PointageService;
  let prisma: any;
  let eventEmitter: any;

  const mockEmployee = {
    id: 'emp-123',
    companyId: 'comp-123',
    userId: 'user-123',
    firstName: 'Amadou',
    lastName: 'Diallo',
    pinCode: '1234',
    status: 'active',
    schedule: {
      id: 'sched-1',
      startTime: '23:59', // Will be in the future, thus on time
      graceMinutes: 15,
    },
  };

  const mockLocation = {
    id: 'loc-1',
    companyId: 'comp-123',
    name: 'Siège Dakar',
    latitude: 14.6937,
    longitude: -17.4441,
    radius: 100, // 100 mètres
    isActive: true,
  };

  beforeEach(async () => {
    prisma = {
      faceDescriptor: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      employee: {
        findFirst: jest.fn().mockResolvedValue(mockEmployee),
        findMany: jest.fn().mockResolvedValue([mockEmployee]),
      },
      location: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      shift: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      attendance: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointageService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PointageService>(PointageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('clockIn', () => {
    it('should successfully clock in a user on time without prior session', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      prisma.attendance.findFirst.mockResolvedValue(null); // No active unclosed session
      prisma.attendance.count.mockResolvedValue(0); // First session today
      prisma.attendance.create.mockImplementation(({ data }: any) => ({
        id: 'att-1',
        ...data,
        employee: mockEmployee,
        location: null,
      }));

      const result = await service.clockIn('comp-123', {
        channel: 'pin',
        payload: { pin: '1234' },
      });

      expect(result).toBeDefined();
      expect(result.employeeId).toBe('emp-123');
      expect(result.isLate).toBe(false);
      expect(prisma.attendance.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('attendance.recorded', expect.anything());
    });

    it('should throw ConflictException if an unclosed session already exists', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      prisma.attendance.findFirst.mockResolvedValue({
        id: 'active-att-1',
        employeeId: 'emp-123',
        clockIn: new Date(),
        clockOut: null,
      });

      await expect(
        service.clockIn('comp-123', {
          channel: 'pin',
          payload: { pin: '1234' },
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow clocking in for a second session if first session is closed (multi-session)', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      // No UNCLOSED session
      prisma.attendance.findFirst.mockResolvedValue(null);
      // But 1 prior session completed today
      prisma.attendance.count.mockResolvedValue(1);
      prisma.attendance.create.mockImplementation(({ data }: any) => ({
        id: 'att-2',
        ...data,
        employee: mockEmployee,
        location: null,
      }));

      const result = await service.clockIn('comp-123', {
        channel: 'web',
        payload: { userId: 'user-123' },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('att-2');
      // Second session must not count as late against morning schedule
      expect(result.isLate).toBe(false);
      expect(result.lateMinutes).toBe(0);
    });

    it('should reject clock in if geofencing distance exceeds site radius', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.count.mockResolvedValue(0);
      prisma.location.findMany.mockResolvedValue([mockLocation]);

      // Coordinates ~5km away from mockLocation
      await expect(
        service.clockIn('comp-123', {
          channel: 'web',
          payload: { userId: 'user-123' },
          latitude: 14.7300,
          longitude: -17.4800,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept clock in and associate locationId if within site radius', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.count.mockResolvedValue(0);
      prisma.location.findMany.mockResolvedValue([mockLocation]);
      prisma.attendance.create.mockImplementation(({ data }: any) => ({
        id: 'att-loc',
        ...data,
        employee: mockEmployee,
        location: mockLocation,
      }));

      // Coordinates essentially on-site (diff of a few meters)
      const result = await service.clockIn('comp-123', {
        channel: 'web',
        payload: { userId: 'user-123' },
        latitude: 14.69371,
        longitude: -17.44411,
      });

      expect(result).toBeDefined();
      expect(prisma.attendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            locationId: 'loc-1',
          }),
        }),
      );
    });
  });

  describe('clockOut', () => {
    it('should successfully close an open session and calculate work duration', async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      prisma.attendance.findFirst.mockResolvedValue({
        id: 'att-open',
        employeeId: 'emp-123',
        clockIn: twoHoursAgo,
        clockOut: null,
        employee: mockEmployee,
      });

      prisma.attendance.update.mockImplementation(({ data }: any) => ({
        id: 'att-open',
        employeeId: 'emp-123',
        clockIn: twoHoursAgo,
        clockOut: data.clockOut,
        employee: mockEmployee,
      }));

      const result = await service.clockOut('emp-123');

      expect(result).toBeDefined();
      expect(result.clockOut).toBeDefined();
      expect(result.work_minutes).toBeGreaterThanOrEqual(119);
      expect(eventEmitter.emit).toHaveBeenCalledWith('attendance.recorded', expect.anything());
    });

    it('should throw NotFoundException if no active session is found to close', async () => {
      prisma.attendance.findFirst.mockResolvedValue(null);

      await expect(service.clockOut('emp-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('punch (Smart Toggle)', () => {
    it('should trigger CLOCK_IN when no session is active', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      prisma.attendance.findFirst.mockResolvedValue(null); // No active session
      prisma.attendance.count.mockResolvedValue(0);
      prisma.attendance.create.mockImplementation(({ data }: any) => ({
        id: 'att-punch-in',
        ...data,
        employee: mockEmployee,
      }));

      const result = await service.punch({
        channel: 'pin',
        payload: { pin: '1234' },
      });

      expect(result.action).toBe('CLOCK_IN');
      expect(result.message).toContain('Bonjour Amadou');
    });

    it('should trigger CLOCK_OUT when an active session is currently open', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // findFirst called by punch (checking active session)
      // and then by clockOut (finding session to update)
      prisma.attendance.findFirst.mockResolvedValue({
        id: 'att-open-punch',
        employeeId: 'emp-123',
        clockIn: oneHourAgo,
        clockOut: null,
        employee: mockEmployee,
      });

      prisma.attendance.update.mockImplementation(({ data }: any) => ({
        id: 'att-open-punch',
        employeeId: 'emp-123',
        clockIn: oneHourAgo,
        clockOut: data.clockOut,
        employee: mockEmployee,
      }));

      const result = await service.punch({
        channel: 'pin',
        payload: { pin: '1234' },
      });

      expect(result.action).toBe('CLOCK_OUT');
      expect(result.message).toContain('Au revoir Amadou');
    });
  });
});
