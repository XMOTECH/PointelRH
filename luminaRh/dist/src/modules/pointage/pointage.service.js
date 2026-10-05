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
                catch {
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
    async resolveEmployee(dto, explicitCompanyId) {
        const companyId = explicitCompanyId || dto.companyId || dto.company_id || dto.payload?.companyId || dto.payload?.company_id;
        let employee = null;
        if (dto.channel === 'pin') {
            const pin = dto.payload?.pin || dto.payload?.pin_code || dto.payload?.pinCode;
            if (!pin)
                throw new common_1.BadRequestException('Code PIN manquant');
            if (companyId) {
                employee = await this.prisma.employee.findFirst({
                    where: { pinCode: String(pin), companyId, status: 'active' },
                    include: { schedule: true },
                });
            }
            else {
                const matching = (await this.prisma.employee.findMany({
                    where: { pinCode: String(pin), status: 'active' },
                    include: { schedule: true },
                })) || [];
                if (matching.length > 1) {
                    throw new common_1.BadRequestException("Plusieurs collaborateurs partagent ce PIN sur des entreprises différentes. Veuillez spécifier l'identifiant de l'entreprise.");
                }
                employee = matching[0] || null;
            }
        }
        else if (dto.channel === 'qr') {
            const token = dto.payload?.token;
            if (!token)
                throw new common_1.BadRequestException('Token QR manquant');
            const location = await this.prisma.location.findFirst({
                where: { qrToken: token, ...(companyId ? { companyId } : {}) },
            });
            if (!location) {
                throw new common_1.NotFoundException('Token de site QR invalide');
            }
            const employeeId = dto.payload?.employeeId || dto.payload?.employee_id;
            if (!employeeId)
                throw new common_1.BadRequestException('ID employé manquant pour le QR code');
            employee = await this.prisma.employee.findFirst({
                where: { id: employeeId, companyId: location.companyId },
                include: { schedule: true },
            });
        }
        else if (dto.channel === 'web') {
            const userId = dto.payload?.userId || dto.payload?.user_id || dto.payload?.employeeId || dto.payload?.employee_id;
            const email = dto.payload?.email;
            if (!userId && !email) {
                throw new common_1.BadRequestException('Identifiant utilisateur ou email manquant');
            }
            employee = await this.prisma.employee.findFirst({
                where: {
                    OR: [
                        ...(userId ? [{ userId }, { id: userId }] : []),
                        ...(email ? [{ email }] : []),
                    ],
                    ...(companyId ? { companyId } : {}),
                },
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
            const startTime = performance.now();
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
            const durationMs = (performance.now() - startTime).toFixed(2);
            if (bestEmployee && minDistance < threshold) {
                this.logger.log(`[FaceRecognition] ✅ Identifié: ${bestEmployee.firstName} ${bestEmployee.lastName} (Distance: ${minDistance.toFixed(4)} < Seuil: ${threshold}) en ${durationMs} ms`);
                employee = bestEmployee;
            }
            else {
                this.logger.warn(`[FaceRecognition] ❌ Échec: distance minimale ${minDistance.toFixed(4)} supérieure au seuil ${threshold}`);
                throw new common_1.NotFoundException('Aucune correspondance faciale trouvée');
            }
        }
        if (!employee) {
            throw new common_1.NotFoundException('Collaborateur introuvable ou inactif');
        }
        return employee;
    }
    async clockIn(companyId, dto) {
        const employee = await this.resolveEmployee(dto, companyId);
        const resolvedCompanyId = companyId || dto.companyId || dto.company_id || employee.companyId;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const todayShift = await this.prisma.shift.findFirst({
            where: {
                employeeId: employee.id,
                date: { gte: todayStart, lte: todayEnd },
                status: { in: ['PUBLISHED', 'CONFIRMED', 'DRAFT'] },
            },
        });
        if (!todayShift && !employee.schedule) {
            throw new common_1.BadRequestException('Aucun planning assigné à cet employé. Veuillez contacter votre responsable.');
        }
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeSession = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockIn: { gte: twentyFourHoursAgo },
                clockOut: null,
            },
            orderBy: { clockIn: 'desc' },
        });
        if (activeSession) {
            const timeStr = activeSession.clockIn.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            throw new common_1.ConflictException({
                statusCode: 409,
                message: `Une session active est déjà ouverte depuis ${timeStr}. Veuillez clôturer votre départ d'abord.`,
                employee_id: employee.id,
                employeeId: employee.id,
                activeSessionId: activeSession.id,
            });
        }
        const priorSessionsTodayCount = await this.prisma.attendance.count({
            where: {
                employeeId: employee.id,
                clockIn: { gte: todayStart, lte: todayEnd },
            },
        });
        const now = new Date();
        let lateMinutes = 0;
        if (priorSessionsTodayCount === 0) {
            const scheduleConfig = todayShift
                ? { startTime: todayShift.startTime, graceMinutes: employee.schedule?.graceMinutes ?? 15 }
                : employee.schedule;
            lateMinutes = this.calculateLateness(now, scheduleConfig);
        }
        let matchedLocationId = null;
        if (dto.channel === 'qr' && dto.payload?.token) {
            const qrLocation = await this.prisma.location.findFirst({
                where: { qrToken: dto.payload.token, companyId: resolvedCompanyId },
            });
            if (qrLocation)
                matchedLocationId = qrLocation.id;
        }
        if (dto.latitude && dto.longitude) {
            const locations = await this.prisma.location.findMany({
                where: { companyId: resolvedCompanyId, isActive: true },
            });
            if (locations.length > 0) {
                let closestLocation = null;
                let minDistance = Infinity;
                for (const loc of locations) {
                    const dist = this.getDistance(dto.latitude, dto.longitude, loc.latitude, loc.longitude);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestLocation = loc;
                    }
                }
                if (closestLocation) {
                    const allowedRadius = closestLocation.radius || 100;
                    if (minDistance <= allowedRadius) {
                        matchedLocationId = closestLocation.id;
                    }
                    else {
                        throw new common_1.BadRequestException(`Pointage refusé : vous êtes en dehors de la zone autorisée (${Math.round(minDistance)}m du site "${closestLocation.name}", rayon autorisé : ${allowedRadius}m).`);
                    }
                }
            }
        }
        const attendanceRecord = await this.prisma.attendance.create({
            data: {
                employeeId: employee.id,
                locationId: matchedLocationId,
                clockIn: now,
                deviceType: dto.channel === 'pin' || dto.channel === 'face' ? 'kiosk' : (dto.channel === 'web' ? 'web' : 'mobile'),
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
        this.eventEmitter.emit('attendance.recorded', { companyId: resolvedCompanyId, employeeId: employee.id });
        return {
            ...attendanceRecord,
            clock_in: attendanceRecord.clockIn,
            clock_out: attendanceRecord.clockOut,
            checked_in_at: attendanceRecord.clockIn,
            checked_out_at: attendanceRecord.clockOut,
        };
    }
    async clockOut(employeeId, dto) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const attendance = await this.prisma.attendance.findFirst({
            where: {
                OR: [
                    { employeeId },
                    { employee: { userId: employeeId } },
                    { employee: { email: employeeId } },
                ],
                clockIn: { gte: twentyFourHoursAgo },
                clockOut: null,
            },
            orderBy: { clockIn: 'desc' },
            include: {
                employee: true,
                location: true,
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException("Aucun pointage d'arrivée actif trouvé à clôturer.");
        }
        const now = new Date();
        const workMinutes = Math.max(0, Math.floor((now.getTime() - attendance.clockIn.getTime()) / 60000));
        const updatedRecord = await this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: now,
            },
            include: {
                employee: true,
                location: true,
            },
        });
        if (attendance.employee?.companyId) {
            this.eventEmitter.emit('attendance.recorded', { companyId: attendance.employee.companyId, employeeId: attendance.employeeId });
        }
        return {
            ...updatedRecord,
            clock_in: updatedRecord.clockIn,
            clock_out: updatedRecord.clockOut,
            checked_in_at: updatedRecord.clockIn,
            checked_out_at: updatedRecord.clockOut,
            work_minutes: workMinutes,
            workMinutes: workMinutes,
        };
    }
    async punch(dto, explicitCompanyId) {
        const employee = await this.resolveEmployee(dto, explicitCompanyId);
        const resolvedCompanyId = explicitCompanyId || dto.companyId || dto.company_id || employee.companyId;
        const action = dto.action || 'auto';
        if (action === 'in') {
            const attendance = await this.clockIn(resolvedCompanyId, {
                channel: dto.channel,
                payload: dto.payload,
                latitude: dto.latitude,
                longitude: dto.longitude,
                companyId: resolvedCompanyId,
            });
            const timeStr = attendance.clockIn.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            return {
                action: 'CLOCK_IN',
                attendance,
                message: `Bonjour ${employee.firstName}, votre arrivée a été enregistrée à ${timeStr}.`,
            };
        }
        if (action === 'out') {
            const attendance = await this.clockOut(employee.id, {
                employee_id: employee.id,
                latitude: dto.latitude,
                longitude: dto.longitude,
            });
            const timeStr = attendance.clockOut ? attendance.clockOut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
            return {
                action: 'CLOCK_OUT',
                attendance,
                message: `Au revoir ${employee.firstName}, votre départ a été enregistré à ${timeStr}.`,
            };
        }
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeSession = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockIn: { gte: twentyFourHoursAgo },
                clockOut: null,
            },
            orderBy: { clockIn: 'desc' },
        });
        if (activeSession) {
            const attendance = await this.clockOut(employee.id, {
                employee_id: employee.id,
                latitude: dto.latitude,
                longitude: dto.longitude,
            });
            const timeStr = attendance.clockOut ? attendance.clockOut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
            return {
                action: 'CLOCK_OUT',
                attendance,
                message: `Au revoir ${employee.firstName}, votre départ a été enregistré à ${timeStr}.`,
            };
        }
        else {
            const attendance = await this.clockIn(resolvedCompanyId, {
                channel: dto.channel,
                payload: dto.payload,
                latitude: dto.latitude,
                longitude: dto.longitude,
                companyId: resolvedCompanyId,
            });
            const timeStr = attendance.clockIn.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            return {
                action: 'CLOCK_IN',
                attendance,
                message: `Bonjour ${employee.firstName}, votre arrivée a été enregistrée à ${timeStr}.`,
            };
        }
    }
    async getTodayStatus(employeeId) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sessions = await this.prisma.attendance.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { employeeId },
                            { employee: { userId: employeeId } },
                            { employee: { email: employeeId } },
                        ],
                    },
                    {
                        OR: [
                            { clockIn: { gte: todayStart, lte: todayEnd } },
                            { clockIn: { gte: twentyFourHoursAgo }, clockOut: null },
                        ],
                    },
                ],
            },
            include: {
                location: true,
            },
            orderBy: {
                clockIn: 'asc',
            },
        });
        if (sessions.length === 0) {
            return null;
        }
        const now = new Date();
        let totalWorkMinutes = 0;
        for (const s of sessions) {
            if (s.clockOut) {
                totalWorkMinutes += Math.max(0, Math.floor((s.clockOut.getTime() - s.clockIn.getTime()) / 60000));
            }
            else {
                totalWorkMinutes += Math.max(0, Math.floor((now.getTime() - s.clockIn.getTime()) / 60000));
            }
        }
        const latest = sessions[sessions.length - 1];
        const hasActiveSession = latest.clockOut === null;
        return {
            ...latest,
            clock_in: latest.clockIn,
            clock_out: latest.clockOut,
            checked_in_at: latest.clockIn,
            checked_out_at: latest.clockOut,
            work_minutes: totalWorkMinutes,
            workMinutes: totalWorkMinutes,
            sessionsCount: sessions.length,
            hasActiveSession,
            activeSessionId: hasActiveSession ? latest.id : null,
            canClockIn: !hasActiveSession,
            canClockOut: hasActiveSession,
            sessions: sessions.map(s => ({
                id: s.id,
                clockIn: s.clockIn,
                clockOut: s.clockOut,
                isLate: s.isLate,
                lateMinutes: s.lateMinutes,
                durationMinutes: s.clockOut
                    ? Math.max(0, Math.floor((s.clockOut.getTime() - s.clockIn.getTime()) / 60000))
                    : Math.max(0, Math.floor((now.getTime() - s.clockIn.getTime()) / 60000)),
            })),
        };
    }
    async getHistory(companyId, filters) {
        let dateFilter = {};
        if (filters.date) {
            const searchDate = new Date(filters.date);
            const start = new Date(searchDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(searchDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = {
                clockIn: {
                    gte: start,
                    lte: end,
                },
            };
        }
        const attendances = await this.prisma.attendance.findMany({
            where: {
                employee: {
                    companyId,
                    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
                },
                ...(filters.locationId ? { locationId: filters.locationId } : {}),
                ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
                ...dateFilter,
            },
            include: {
                employee: true,
                location: true,
            },
            orderBy: {
                clockIn: 'desc',
            },
        });
        return attendances.map(a => ({
            ...a,
            clock_in: a.clockIn,
            clock_out: a.clockOut,
            checked_in_at: a.clockIn,
            checked_out_at: a.clockOut,
            work_minutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
            workMinutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
        }));
    }
    async getByEmployeeIds(companyId, employeeIds) {
        const attendances = await this.prisma.attendance.findMany({
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
        return attendances.map(a => ({
            ...a,
            clock_in: a.clockIn,
            clock_out: a.clockOut,
            checked_in_at: a.clockIn,
            checked_out_at: a.clockOut,
            work_minutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
            workMinutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
        }));
    }
    calculateLateness(now, schedule) {
        const startTimeStr = schedule?.startTime || schedule?.name || '08:00';
        const graceMins = schedule?.graceMinutes ?? 15;
        const match = startTimeStr.match(/(\d{2}):(\d{2})/);
        if (!match)
            return 0;
        const startHour = parseInt(match[1], 10);
        const startMin = parseInt(match[2], 10);
        const expectedTime = new Date(now);
        expectedTime.setHours(startHour, startMin, 0, 0);
        const maxAllowedTime = new Date(expectedTime.getTime() + graceMins * 60 * 1000);
        if (now.getTime() <= maxAllowedTime.getTime()) {
            return 0;
        }
        return Math.max(0, Math.floor((now.getTime() - expectedTime.getTime()) / 60000));
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