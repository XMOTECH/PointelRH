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
                startTime: dto.start_time || '08:00',
                endTime: dto.end_time || '17:00',
                graceMinutes: dto.grace_minutes ?? 15,
                workDays: dto.work_days && dto.work_days.length > 0 ? dto.work_days : [1, 2, 3, 4, 5],
            },
            include: {
                _count: { select: { employees: true } },
                employees: {
                    select: { id: true, firstName: true, lastName: true, jobTitle: true },
                    take: 6,
                },
            },
        });
        return this.mapToResource(schedule);
    }
    async findAll(companyId) {
        const schedules = await this.prisma.schedule.findMany({
            where: { companyId },
            include: {
                _count: { select: { employees: true } },
                employees: {
                    select: { id: true, firstName: true, lastName: true, jobTitle: true },
                    take: 12,
                },
            },
            orderBy: { name: 'asc' },
        });
        return schedules.map(s => this.mapToResource(s));
    }
    async findOne(companyId, id) {
        const schedule = await this.prisma.schedule.findFirst({
            where: { id, companyId },
            include: {
                _count: { select: { employees: true } },
                employees: {
                    select: { id: true, firstName: true, lastName: true, jobTitle: true },
                    take: 12,
                },
            },
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
                ...(dto.name ? { name: dto.name } : {}),
                ...(dto.start_time ? { startTime: dto.start_time } : {}),
                ...(dto.end_time ? { endTime: dto.end_time } : {}),
                ...(dto.grace_minutes !== undefined ? { graceMinutes: dto.grace_minutes } : {}),
                ...(dto.work_days ? { workDays: dto.work_days } : {}),
            },
            include: {
                _count: { select: { employees: true } },
                employees: {
                    select: { id: true, firstName: true, lastName: true, jobTitle: true },
                    take: 6,
                },
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
    async assignEmployees(companyId, scheduleId, employeeIds) {
        await this.findOne(companyId, scheduleId);
        if (employeeIds && employeeIds.length > 0) {
            await this.prisma.employee.updateMany({
                where: {
                    companyId,
                    scheduleId,
                    id: { notIn: employeeIds },
                },
                data: {
                    scheduleId: null,
                },
            });
        }
        else {
            await this.prisma.employee.updateMany({
                where: {
                    companyId,
                    scheduleId,
                },
                data: {
                    scheduleId: null,
                },
            });
        }
        if (employeeIds && employeeIds.length > 0) {
            await this.prisma.employee.updateMany({
                where: {
                    companyId,
                    id: { in: employeeIds },
                },
                data: {
                    scheduleId,
                },
            });
        }
        return this.findOne(companyId, scheduleId);
    }
    mapToResource(schedule) {
        return {
            id: schedule.id,
            name: schedule.name,
            start_time: schedule.startTime || '08:00',
            end_time: schedule.endTime || '17:00',
            work_days: schedule.workDays && schedule.workDays.length > 0 ? schedule.workDays : [1, 2, 3, 4, 5],
            grace_minutes: schedule.graceMinutes ?? 15,
            assigned_employees_count: schedule._count?.employees ?? 0,
            assigned_employees: (schedule.employees || []).map((e) => ({
                id: e.id,
                first_name: e.firstName,
                last_name: e.lastName,
                job_title: e.jobTitle,
            })),
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