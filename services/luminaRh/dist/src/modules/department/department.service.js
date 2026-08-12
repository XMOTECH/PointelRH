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
        return this.mapToResource(department);
    }
    async findAll(companyId) {
        const departments = await this.prisma.department.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
        return departments.map(d => this.mapToResource(d));
    }
    async findOne(companyId, id) {
        const department = await this.prisma.department.findFirst({
            where: { id, companyId },
        });
        if (!department) {
            throw new common_1.NotFoundException('Département introuvable');
        }
        return this.mapToResource(department);
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        const updated = await this.prisma.department.update({
            where: { id },
            data: {
                name: dto.name,
            },
        });
        return this.mapToResource(updated);
    }
    async remove(companyId, id) {
        await this.findOne(companyId, id);
        await this.prisma.department.delete({
            where: { id },
        });
        return { success: true };
    }
    mapToResource(dept) {
        return {
            id: dept.id,
            name: dept.name,
            parent_id: null,
            created_at: dept.createdAt,
            updated_at: dept.updatedAt,
        };
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentService);
//# sourceMappingURL=department.service.js.map