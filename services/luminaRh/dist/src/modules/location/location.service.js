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
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
let LocationService = class LocationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        const qrToken = (0, crypto_1.randomUUID)();
        const location = await this.prisma.location.create({
            data: {
                companyId,
                name: dto.name,
                address: dto.address,
                latitude: dto.latitude,
                longitude: dto.longitude,
                radius: dto.radius_meters,
                isActive: dto.is_active !== undefined ? dto.is_active : true,
                qrToken,
            },
        });
        return this.mapToSite(location);
    }
    async findAll(companyId) {
        const locations = await this.prisma.location.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
        return locations.map(loc => this.mapToSite(loc));
    }
    async findOne(companyId, id) {
        const location = await this.prisma.location.findFirst({
            where: { id, companyId },
        });
        if (!location) {
            throw new common_1.NotFoundException('Site géographique introuvable');
        }
        return this.mapToSite(location);
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        const updated = await this.prisma.location.update({
            where: { id },
            data: {
                name: dto.name,
                address: dto.address,
                latitude: dto.latitude,
                longitude: dto.longitude,
                radius: dto.radius_meters,
                isActive: dto.is_active,
            },
        });
        return this.mapToSite(updated);
    }
    async remove(companyId, id) {
        await this.findOne(companyId, id);
        await this.prisma.location.delete({
            where: { id },
        });
        return { success: true };
    }
    async generateQr(companyId, id) {
        await this.findOne(companyId, id);
        const qrToken = (0, crypto_1.randomUUID)();
        const updated = await this.prisma.location.update({
            where: { id },
            data: { qrToken },
        });
        return {
            qr_token: updated.qrToken,
        };
    }
    mapToSite(loc) {
        return {
            id: loc.id,
            name: loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            radius_meters: loc.radius,
            is_active: loc.isActive,
            qr_token: loc.qrToken,
            created_at: loc.createdAt,
            updated_at: loc.updatedAt,
        };
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationService);
//# sourceMappingURL=location.service.js.map