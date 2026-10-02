import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: string, dto: CreateEmployeeDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà associé à un utilisateur');
    }

    // Verify department exists and belongs to the company
    const dept = await this.prisma.department.findFirst({
      where: { id: dto.departmentId, companyId },
    });
    if (!dept) {
      throw new NotFoundException('Département introuvable');
    }

    // Verify schedule if provided
    if (dto.scheduleId) {
      const schedule = await this.prisma.schedule.findFirst({
        where: { id: dto.scheduleId, companyId },
      });
      if (!schedule) {
        throw new NotFoundException('Planning introuvable');
      }
    }

    // Use a transaction to ensure both User and Employee are created or fail together (Atomicity!)
    return this.prisma.$transaction(async (tx) => {
      // 1. Create local User credentials record
      const user = await tx.user.create({
        data: {
          companyId,
          email: dto.email,
          password: 'KEYCLOAK_MANAGED_SECRET', // Password is managed inside Keycloak
          name: `${dto.firstName} ${dto.lastName}`,
          role: dto.role || 'employee',
          departmentId: dto.departmentId,
          isActive: true,
        },
      });

      // 2. Create Employee profile
      const employee = await tx.employee.create({
        data: {
          companyId,
          userId: user.id,
          departmentId: dto.departmentId,
          scheduleId: dto.scheduleId || null,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          pinCode: dto.pinCode || null,
          contractType: dto.contractType || 'cdi',
          hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
          status: 'active',
        },
        include: {
          department: true,
          schedule: true,
        },
      });

      return employee;
    });
  }

  async list(companyId: string, filters: { departmentId?: string; status?: string; contractType?: string; role?: string }) {
    return this.prisma.employee.findMany({
      where: {
        companyId,
        departmentId: filters.departmentId,
        status: filters.status,
        contractType: filters.contractType,
        user: filters.role ? { role: filters.role } : undefined,
      },
      include: {
        department: true,
        schedule: true,
        user: {
          select: {
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findOne(companyId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        department: true,
        schedule: true,
        user: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employé introuvable');
    }

    return employee;
  }

  async update(companyId: string, id: string, dto: Partial<CreateEmployeeDto> & { status?: string }) {
    const employee = await this.findOne(companyId, id);

    // Verify department if updated
    if (dto.departmentId && dto.departmentId !== employee.departmentId) {
      const dept = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, companyId },
      });
      if (!dept) {
        throw new NotFoundException('Département introuvable');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update User info if name or email changed
      if (dto.firstName || dto.lastName || dto.role) {
        await tx.user.update({
          where: { id: employee.userId },
          data: {
            name: `${dto.firstName || employee.firstName} ${dto.lastName || employee.lastName}`,
            role: dto.role,
            departmentId: dto.departmentId,
          },
        });
      }

      // 2. Update Employee
      return tx.employee.update({
        where: { id },
        data: {
          departmentId: dto.departmentId,
          scheduleId: dto.scheduleId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          pinCode: dto.pinCode,
          contractType: dto.contractType,
          hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
          status: dto.status,
        },
        include: {
          department: true,
          schedule: true,
        },
      });
    });
  }

  async remove(companyId: string, id: string) {
    const employee = await this.findOne(companyId, id);

    return this.prisma.$transaction(async (tx) => {
      // Delete Employee and its linked local User
      await tx.employee.delete({ where: { id } });
      await tx.user.delete({ where: { id: employee.userId } });
      return { deleted: true };
    });
  }

  async getFaceEnrollment(employeeId: string) {
    const descriptors = await this.prisma.faceDescriptor.findMany({
      where: {
        OR: [
          { employeeId },
          { employee: { userId: employeeId } },
        ],
      },
    });
    return {
      enrolled: descriptors.length > 0,
      count: descriptors.length,
      labels: descriptors.map((_, index) => `Capture ${index + 1}`),
    };
  }

  async enrollFace(employeeId: string, descriptors: any[]) {
    // Resolve employee id if userId was passed
    const emp = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { id: employeeId },
          { userId: employeeId },
        ],
      },
      select: { id: true },
    });
    const resolvedEmployeeId = emp ? emp.id : employeeId;

    await this.prisma.$transaction(async (tx) => {
      // Clear previous descriptors first
      await tx.faceDescriptor.deleteMany({
        where: { employeeId: resolvedEmployeeId },
      });

      // Save the new descriptors
      for (const entry of descriptors) {
        const val = Array.isArray(entry) ? entry : entry.descriptor;
        if (val) {
          await tx.faceDescriptor.create({
            data: {
              employeeId: resolvedEmployeeId,
              descriptor: JSON.stringify(val),
            },
          });
        }
      }
    });

    this.eventEmitter.emit('face.registered', { employeeId: resolvedEmployeeId });
  }

  async deleteFaceEnrollment(employeeId: string) {
    // Resolve employee id if userId was passed
    const emp = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { id: employeeId },
          { userId: employeeId },
        ],
      },
      select: { id: true },
    });
    const resolvedEmployeeId = emp ? emp.id : employeeId;

    await this.prisma.faceDescriptor.deleteMany({
      where: {
        OR: [
          { employeeId: resolvedEmployeeId },
          { employeeId },
        ],
      },
    });

    this.eventEmitter.emit('face.deleted', { employeeId: resolvedEmployeeId });
  }

  async generatePin(companyId: string, employeeId: string) {
    const employee = await this.findOne(companyId, employeeId);

    // Generate a unique 4-digit PIN code
    let pinCode = '';
    let isUnique = false;
    while (!isUnique) {
      pinCode = Math.floor(1000 + Math.random() * 9000).toString();
      const existing = await this.prisma.employee.findFirst({
        where: { pinCode, companyId },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: { pinCode },
      include: {
        department: true,
        schedule: true,
      },
    });

    // Optionally notify employee with new PIN via event
    this.eventEmitter.emit('employee.pin_generated', {
      employee: updatedEmployee,
      pinCode,
    });

    return updatedEmployee;
  }
}

