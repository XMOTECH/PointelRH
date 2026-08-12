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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
let EmployeeService = class EmployeeService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(companyId, dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Cet email est déjà associé à un utilisateur');
        }
        const dept = await this.prisma.department.findFirst({
            where: { id: dto.departmentId, companyId },
        });
        if (!dept) {
            throw new common_1.NotFoundException('Département introuvable');
        }
        if (dto.scheduleId) {
            const schedule = await this.prisma.schedule.findFirst({
                where: { id: dto.scheduleId, companyId },
            });
            if (!schedule) {
                throw new common_1.NotFoundException('Planning introuvable');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    companyId,
                    email: dto.email,
                    password: 'KEYCLOAK_MANAGED_SECRET',
                    name: `${dto.firstName} ${dto.lastName}`,
                    role: dto.role || 'employee',
                    departmentId: dto.departmentId,
                    isActive: true,
                },
            });
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
    async list(companyId, filters) {
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
    async findOne(companyId, id) {
        const employee = await this.prisma.employee.findFirst({
            where: { id, companyId },
            include: {
                department: true,
                schedule: true,
                user: true,
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        return employee;
    }
    async update(companyId, id, dto) {
        const employee = await this.findOne(companyId, id);
        if (dto.departmentId && dto.departmentId !== employee.departmentId) {
            const dept = await this.prisma.department.findFirst({
                where: { id: dto.departmentId, companyId },
            });
            if (!dept) {
                throw new common_1.NotFoundException('Département introuvable');
            }
        }
        return this.prisma.$transaction(async (tx) => {
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
    async remove(companyId, id) {
        const employee = await this.findOne(companyId, id);
        return this.prisma.$transaction(async (tx) => {
            await tx.employee.delete({ where: { id } });
            await tx.user.delete({ where: { id: employee.userId } });
            return { deleted: true };
        });
    }
    async getFaceEnrollment(employeeId) {
        const descriptors = await this.prisma.faceDescriptor.findMany({
            where: { employeeId },
        });
        return {
            enrolled: descriptors.length > 0,
            count: descriptors.length,
            labels: descriptors.map((_, index) => `Capture ${index + 1}`),
        };
    }
    async enrollFace(employeeId, descriptors) {
        await this.prisma.$transaction(async (tx) => {
            await tx.faceDescriptor.deleteMany({
                where: { employeeId },
            });
            for (const entry of descriptors) {
                const val = Array.isArray(entry) ? entry : entry.descriptor;
                if (val) {
                    await tx.faceDescriptor.create({
                        data: {
                            employeeId,
                            descriptor: JSON.stringify(val),
                        },
                    });
                }
            }
        });
    }
    async deleteFaceEnrollment(employeeId) {
        await this.prisma.faceDescriptor.deleteMany({
            where: { employeeId },
        });
    }
    async generatePin(companyId, employeeId) {
        const employee = await this.findOne(companyId, employeeId);
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
        this.eventEmitter.emit('employee.pin_generated', {
            employee: updatedEmployee,
            pinCode,
        });
        return updatedEmployee;
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map