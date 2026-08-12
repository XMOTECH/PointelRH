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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ScheduleService = class ScheduleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        const schedule = await this.prisma.schedule.create({
            data: {
                companyId,
                name: dto.name,
            },
        });
        return this.mapToResource(schedule);
    }
    async findAll(companyId) {
        const schedules = await this.prisma.schedule.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
        return schedules.map(s => this.mapToResource(s));
    }
    async findOne(companyId, id) {
        const schedule = await this.prisma.schedule.findFirst({
            where: { id, companyId },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Horaire introuvable');
        }
        return this.mapToResource(schedule);
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        const updated = await this.prisma.schedule.update({
            where: { id },
            data: {
                name: dto.name,
            },
        });
        return this.mapToResource(updated);
    }
    async remove(companyId, id) {
        await this.findOne(companyId, id);
        await this.prisma.schedule.delete({
            where: { id },
        });
        return { success: true };
    }
    mapToResource(schedule) {
        return {
            id: schedule.id,
            name: schedule.name,
            start_time: null,
            end_time: null,
            work_days: [],
            grace_minutes: null,
            created_at: schedule.createdAt,
            updated_at: schedule.updatedAt,
        };
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map