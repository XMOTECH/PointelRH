import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { KeycloakAdminService } from './keycloak-admin.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => defaultValue),
          },
        },
        {
          provide: KeycloakAdminService,
          useValue: {
            createUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verify', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.verify('unknown@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user account is disabled', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'disabled@example.com',
        isActive: false,
      });

      await expect(service.verify('disabled@example.com')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return user profile data when user is active', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Amadou Sow',
        email: 'amadou@example.com',
        role: 'admin',
        companyId: 'company-1',
        isActive: true,
        employee: { id: 'emp-1' },
        departmentId: 'dept-1',
      });

      const result = await service.verify('amadou@example.com');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('amadou@example.com');
      expect(result.user.role).toBe('admin');
      expect(result.user.permissions).toContain('manage_employees');
    });
  });
});
