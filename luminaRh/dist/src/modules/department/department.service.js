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
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DepartmentService = class DepartmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        const department = await this.prisma.department.create({
            data: {
                companyId,
                name: dto.name,
            },
        });
        if (dto.manager_id) {
            const emp = await this.prisma.employee.findFirst({
                where: { id: dto.manager_id, companyId },
            });
            if (!emp) {
                throw new common_1.NotFoundException('Employé désigné comme manager introuvable dans cette entreprise');
            }
            await this.prisma.employee.update({
                where: { id: dto.manager_id },
                data: { departmentId: department.id },
            });
            if (emp.userId) {
                await this.prisma.user.update({
                    where: { id: emp.userId },
                    data: { role: 'manager' },
                });
            }
        }
        return this.findOne(companyId, department.id);
    }
    async findAll(companyId) {
        const departments = await this.prisma.department.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: { select: { role: true } },
                    },
                },
            },
        });
        return departments.map(d => {
            const manager = d.employees.find(e => e.user?.role === 'manager' || e.user?.role === 'admin') || d.employees[0];
            return {
                id: d.id,
                name: d.name,
                manager_name: manager ? `${manager.firstName} ${manager.lastName}`.trim() : null,
                employee_count: d.employees.length,
                created_at: d.createdAt,
                updated_at: d.updatedAt,
            };
        });
    }
    async findOne(companyId, id) {
        const department = await this.prisma.department.findFirst({
            where: { id, companyId },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: { select: { role: true } },
                    },
                },
            },
        });
        if (!department) {
            throw new common_1.NotFoundException('Département introuvable');
        }
        const manager = department.employees.find(e => e.user?.role === 'manager' || e.user?.role === 'admin') || department.employees[0];
        return {
            id: department.id,
            name: department.name,
            manager_name: manager ? `${manager.firstName} ${manager.lastName}`.trim() : null,
            employee_count: department.employees.length,
            created_at: department.createdAt,
            updated_at: department.updatedAt,
        };
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        const updated = await this.prisma.department.update({
            where: { id },
            data: {
                ...(dto.name ? { name: dto.name } : {}),
            },
        });
        if (dto.manager_id) {
            const emp = await this.prisma.employee.findFirst({
                where: { id: dto.manager_id, companyId },
            });
            if (!emp) {
                throw new common_1.NotFoundException('Employé désigné comme manager introuvable dans cette entreprise');
            }
            await this.prisma.employee.update({
                where: { id: dto.manager_id },
                data: { departmentId: id },
            });
            if (emp.userId) {
                await this.prisma.user.update({
                    where: { id: emp.userId },
                    data: { role: 'manager' },
                });
            }
        }
        return this.findOne(companyId, id);
    }
    async remove(companyId, id) {
        await this.findOne(companyId, id);
        const employeeCount = await this.prisma.employee.count({
            where: { departmentId: id, companyId },
        });
        if (employeeCount > 0) {
            throw new common_1.BadRequestException(`Impossible de supprimer ce département car il contient encore ${employeeCount} employé(s). Veuillez les réaffecter d'abord.`);
        }
        await this.prisma.department.delete({
            where: { id },
        });
        return { success: true };
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentService);
//# sourceMappingURL=department.service.js.map