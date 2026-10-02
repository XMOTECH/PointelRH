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
exports.ShiftTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ShiftTemplateService = class ShiftTemplateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        return this.prisma.shiftTemplate.create({
            data: {
                companyId,
                departmentId: dto.departmentId || null,
                name: dto.name,
                startTime: dto.startTime,
                endTime: dto.endTime,
                breakMinutes: dto.breakMinutes ?? 0,
                color: dto.color || '#3B82F6',
                jobTitle: dto.jobTitle || null,
            },
        });
    }
    async findAll(companyId, departmentId) {
        return this.prisma.shiftTemplate.findMany({
            where: {
                companyId,
                isActive: true,
                ...(departmentId ? { OR: [{ departmentId }, { departmentId: null }] } : {}),
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async findOne(companyId, id) {
        const template = await this.prisma.shiftTemplate.findFirst({
            where: { id, companyId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Modèle de shift introuvable.');
        }
        return template;
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        return this.prisma.shiftTemplate.update({
            where: { id },
            data: {
                ...(dto.name ? { name: dto.name } : {}),
                ...(dto.startTime ? { startTime: dto.startTime } : {}),
                ...(dto.endTime ? { endTime: dto.endTime } : {}),
                ...(dto.breakMinutes !== undefined ? { breakMinutes: dto.breakMinutes } : {}),
                ...(dto.color !== undefined ? { color: dto.color } : {}),
                ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
        });
    }
    async remove(companyId, id) {
        await this.findOne(companyId, id);
        return this.prisma.shiftTemplate.update({
            where: { id },
            data: { isActive: false },
        });
    }
};
exports.ShiftTemplateService = ShiftTemplateService;
exports.ShiftTemplateService = ShiftTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShiftTemplateService);
//# sourceMappingURL=shift-template.service.js.map