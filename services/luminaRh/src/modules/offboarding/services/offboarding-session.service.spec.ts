import { Test, TestingModule } from '@nestjs/testing';
import { OffboardingSessionService } from './offboarding-session.service';
import { OffboardingAuditService } from './offboarding-audit.service';
import { OffboardingTemplateService } from './offboarding-template.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { OffboardingStatus, DepartureReason, OffboardingTaskStatus } from '../entities/offboarding.enums';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('OffboardingSessionService', () => {
  let service: OffboardingSessionService;
  let prisma: any;
  let auditService: any;
  let templateService: any;

  const mockEmployee = {
    id: 'emp-100',
    companyId: 'comp-100',
    userId: 'usr-100',
    firstName: 'Fatou',
    lastName: 'Ndiaye',
    email: 'fatou@company.sn',
    status: 'active',
    department: { name: 'Comptabilité' },
    user: { id: 'usr-100', isActive: true },
  };

  const mockTemplate = {
    id: 'tpl-100',
    companyId: 'comp-100',
    name: 'Départ Standard',
    templateTasks: [
      {
        title: 'Restitution PC',
        category: 'it',
        assignedRole: 'it',
        daysOffset: 0,
        isRequired: true,
      },
      {
        title: 'Solde de tout compte',
        category: 'finance',
        assignedRole: 'hr',
        daysOffset: 0,
        isRequired: true,
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      employee: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
      offboardingSession: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      offboardingTask: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      leaveBalance: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      advanceRequest: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      task: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    auditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    templateService = {
      findOne: jest.fn().mockResolvedValue(mockTemplate),
      findAll: jest.fn().mockResolvedValue([mockTemplate]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffboardingSessionService,
        { provide: PrismaService, useValue: prisma },
        { provide: OffboardingAuditService, useValue: auditService },
        { provide: OffboardingTemplateService, useValue: templateService },
      ],
    }).compile();

    service = module.get<OffboardingSessionService>(OffboardingSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create an offboarding session with cloned tasks and log audit', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      prisma.offboardingSession.findFirst.mockResolvedValue(null); // No existing active session
      prisma.offboardingSession.create.mockImplementation(({ data }: any) => ({
        id: 'sess-100',
        ...data,
        employee: mockEmployee,
        tasks: data.tasks.create,
      }));

      const result = await service.createSession('comp-100', {
        employeeId: 'emp-100',
        departureReason: DepartureReason.RESIGNATION,
        lastWorkingDate: '2026-10-31',
        contractEndDate: '2026-10-31',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('sess-100');
      expect(result.status).toBe(OffboardingStatus.INITIATED);
      expect(prisma.offboardingSession.create).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 'sess-100' }),
      );
    });

    it('should throw ConflictException if an active offboarding is already underway', async () => {
      prisma.employee.findFirst.mockResolvedValue(mockEmployee);
      prisma.offboardingSession.findFirst.mockResolvedValue({ id: 'existing-sess' });

      await expect(
        service.createSession('comp-100', {
          employeeId: 'emp-100',
          departureReason: DepartureReason.RESIGNATION,
          lastWorkingDate: '2026-10-31',
          contractEndDate: '2026-10-31',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateTask', () => {
    it('should update task status and recalculate session progress', async () => {
      prisma.offboardingTask.findFirst.mockResolvedValue({
        id: 'task-1',
        sessionId: 'sess-100',
        title: 'Restitution PC',
        status: OffboardingTaskStatus.PENDING,
      });

      prisma.offboardingTask.update.mockResolvedValue({
        id: 'task-1',
        status: OffboardingTaskStatus.COMPLETED,
      });

      // 2 total tasks, 1 completed
      prisma.offboardingTask.findMany.mockResolvedValue([
        { id: 'task-1', status: OffboardingTaskStatus.COMPLETED },
        { id: 'task-2', status: OffboardingTaskStatus.PENDING },
      ]);

      const result = await service.updateTask('comp-100', 'task-1', {
        status: OffboardingTaskStatus.COMPLETED,
        notes: 'PC Dell et chargeur retournés en bon état.',
      });

      expect(result.status).toBe(OffboardingTaskStatus.COMPLETED);
      // 1 out of 2 = 50%
      expect(prisma.offboardingSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-100' },
          data: { progressPercent: 50 },
        }),
      );
    });
  });

  describe('transitionStatus', () => {
    it('should deactivate employee and Keycloak user on COMPLETED', async () => {
      prisma.offboardingSession.findFirst.mockResolvedValue({
        id: 'sess-100',
        employeeId: 'emp-100',
        status: OffboardingStatus.PENDING_DOCUMENTS,
        lastWorkingDate: new Date(),
        contractEndDate: new Date(),
        tasks: [
          { isRequired: true, status: OffboardingTaskStatus.COMPLETED },
        ],
        employee: mockEmployee,
      });

      prisma.offboardingSession.update.mockResolvedValue({
        id: 'sess-100',
        status: OffboardingStatus.COMPLETED,
      });

      const result = await service.transitionStatus(
        'comp-100',
        'sess-100',
        { type: 'COMPLETE_OFFBOARDING' },
        'admin-user',
      );

      expect(result.status).toBe(OffboardingStatus.COMPLETED);
      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: 'emp-100' },
        data: { status: 'inactive' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-100' },
        data: { isActive: false },
      });
    });
  });
});
