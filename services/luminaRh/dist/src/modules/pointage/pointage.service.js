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
var PointageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointageService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
let PointageService = PointageService_1 = class PointageService {
    prisma;
    eventEmitter;
    faceDescriptorsCache = [];
    logger = new common_1.Logger(PointageService_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async onModuleInit() {
        await this.refreshFaceCache();
    }
    async refreshFaceCache() {
        try {
            const allDescriptors = await this.prisma.faceDescriptor.findMany({
                where: {
                    employee: {
                        status: 'active',
                    },
                },
                include: {
                    employee: {
                        include: { schedule: true },
                    },
                },
            });
            const cache = [];
            for (const fd of allDescriptors) {
                try {
                    const dbDesc = JSON.parse(fd.descriptor);
                    if (Array.isArray(dbDesc)) {
                        cache.push({
                            employee: fd.employee,
                            descriptor: dbDesc,
                        });
                    }
                }
                catch (e) {
                }
            }
            this.faceDescriptorsCache = cache;
            this.logger.log(`[PointageService] Loaded ${this.faceDescriptorsCache.length} face descriptors into RAM cache.`);
        }
        catch (err) {
            this.logger.error('[PointageService] Failed to load face descriptors cache:', err);
        }
    }
    async handleFaceRegistered(payload) {
        this.logger.log(`[PointageService] Invalidation of face cache due to new registration for employee ${payload.employeeId}`);
        await this.refreshFaceCache();
    }
    async handleFaceDeleted(payload) {
        this.logger.log(`[PointageService] Invalidation of face cache due to deletion for employee ${payload.employeeId}`);
        await this.refreshFaceCache();
    }
    async clockIn(companyId, dto) {
        let employee = null;
        if (dto.channel === 'pin') {
            const pin = dto.payload.pin;
            if (!pin)
                throw new common_1.BadRequestException('Code PIN manquant');
            employee = await this.prisma.employee.findFirst({
                where: { pinCode: pin, companyId },
                include: { schedule: true },
            });
        }
        else if (dto.channel === 'qr') {
            const token = dto.payload.token;
            if (!token)
                throw new common_1.BadRequestException('Token QR manquant');
            const location = await this.prisma.location.findFirst({
                where: { qrToken: token, companyId },
            });
            if (!location) {
                throw new common_1.NotFoundException('Token de site invalide');
            }
            const employeeId = dto.payload.employeeId;
            if (!employeeId)
                throw new common_1.BadRequestException('ID employé manquant');
            employee = await this.prisma.employee.findFirst({
                where: { id: employeeId, companyId },
                include: { schedule: true },
            });
        }
        else if (dto.channel === 'web') {
            const userId = dto.payload?.userId || dto.payload?.user_id;
            if (!userId)
                throw new common_1.BadRequestException('Identifiant utilisateur manquant');
            employee = await this.prisma.employee.findUnique({
                where: { userId },
                include: { schedule: true },
            });
        }
        else if (dto.channel === 'face') {
            const inputDescriptor = dto.payload?.descriptor;
            if (!inputDescriptor || !Array.isArray(inputDescriptor)) {
                throw new common_1.BadRequestException('Descripteur facial manquant ou invalide');
            }
            let bestEmployee = null;
            let minDistance = 999.0;
            const threshold = 0.55;
            for (const item of this.faceDescriptorsCache) {
                if (companyId && item.employee.companyId !== companyId) {
                    continue;
                }
                const dbDesc = item.descriptor;
                if (dbDesc.length === inputDescriptor.length) {
                    let sum = 0;
                    for (let i = 0; i < dbDesc.length; i++) {
                        const diff = dbDesc[i] - inputDescriptor[i];
                        sum += diff * diff;
                    }
                    const distance = Math.sqrt(sum);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestEmployee = item.employee;
                    }
                }
            }
            if (bestEmployee && minDistance < threshold) {
                employee = bestEmployee;
            }
            else {
                throw new common_1.NotFoundException('Aucune correspondance faciale trouvée');
            }
        }
        if (!employee) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        const resolvedCompanyId = companyId || employee.companyId;
        if (!employee.schedule) {
            throw new common_1.BadRequestException('Aucun planning assigné à cet employé. Veuillez contacter votre responsable.');
        }
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const existingAttendance = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockIn: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
        if (existingAttendance) {
            throw new common_1.ConflictException({
                statusCode: 409,
                message: 'L\'employé a déjà pointé aujourd\'hui',
                employee_id: employee.id,
                employeeId: employee.id,
            });
        }
        const now = new Date();
        const lateMinutes = this.calculateLateness(now, employee.schedule.name);
        let isWithinZone = true;
        let locationId = employee.departmentId;
        const location = await this.prisma.location.findFirst({
            where: { companyId: resolvedCompanyId },
        });
        if (location && dto.latitude && dto.longitude) {
            locationId = location.id;
            const distance = this.getDistance(dto.latitude, dto.longitude, location.latitude, location.longitude);
            isWithinZone = distance <= location.radius;
        }
        const attendanceRecord = await this.prisma.attendance.create({
            data: {
                employeeId: employee.id,
                locationId: location ? location.id : null,
                clockIn: now,
                deviceType: dto.channel === 'pin' ? 'kiosk' : (dto.channel === 'web' ? 'web' : 'mobile'),
                latitude: dto.latitude || null,
                longitude: dto.longitude || null,
                isLate: lateMinutes > 0,
                lateMinutes: lateMinutes,
            },
            include: {
                employee: true,
                location: true,
            },
        });
        this.eventEmitter.emit('attendance.recorded', { companyId: resolvedCompanyId });
        return attendanceRecord;
    }
    async clockOut(employeeId, dto) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const attendance = await this.prisma.attendance.findFirst({
            where: {
                employeeId,
                clockIn: {
                    gte: todayStart,
                    lte: todayEnd,
                },
                clockOut: null,
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Aucun pointage d\'entrée actif trouvé pour aujourd\'hui');
        }
        const updatedRecord = await this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: new Date(),
            },
        });
        const emp = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            select: { companyId: true },
        });
        if (emp) {
            this.eventEmitter.emit('attendance.recorded', { companyId: emp.companyId });
        }
        return updatedRecord;
    }
    async getTodayStatus(employeeId) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        return this.prisma.attendance.findFirst({
            where: {
                employeeId,
                clockIn: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
            include: {
                location: true,
            },
        });
    }
    async getHistory(companyId, filters) {
        const searchDate = filters.date ? new Date(filters.date) : new Date();
        const start = new Date(searchDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(searchDate);
        end.setHours(23, 59, 59, 999);
        return this.prisma.attendance.findMany({
            where: {
                employee: {
                    companyId,
                    departmentId: filters.departmentId,
                },
                locationId: filters.locationId,
                clockIn: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                employee: true,
                location: true,
            },
            orderBy: {
                clockIn: 'desc',
            },
        });
    }
    async getByEmployeeIds(companyId, employeeIds) {
        return this.prisma.attendance.findMany({
            where: {
                employee: {
                    id: { in: employeeIds },
                    companyId,
                },
            },
            include: {
                employee: true,
                location: true,
            },
            orderBy: {
                clockIn: 'desc',
            },
        });
    }
    calculateLateness(now, scheduleName) {
        const match = scheduleName.match(/(\d{2}):(\d{2})/);
        if (!match)
            return 0;
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const checkTime = new Date(now);
        checkTime.setHours(hours, minutes, 0, 0);
        if (now.getTime() <= checkTime.getTime()) {
            return 0;
        }
        return Math.floor((now.getTime() - checkTime.getTime()) / 60000);
    }
    getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
exports.PointageService = PointageService;
__decorate([
    (0, event_emitter_1.OnEvent)('face.registered'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointageService.prototype, "handleFaceRegistered", null);
__decorate([
    (0, event_emitter_1.OnEvent)('face.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointageService.prototype, "handleFaceDeleted", null);
exports.PointageService = PointageService = PointageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], PointageService);
//# sourceMappingURL=pointage.service.js.map