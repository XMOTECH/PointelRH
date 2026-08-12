import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateLocationDto) {
    const qrToken = randomUUID(); // Génération d'un jeton QR Code unique de sécurité

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

  async findAll(companyId: string) {
    const locations = await this.prisma.location.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    return locations.map(loc => this.mapToSite(loc));
  }

  async findOne(companyId: string, id: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, companyId },
    });

    if (!location) {
      throw new NotFoundException('Site géographique introuvable');
    }

    return this.mapToSite(location);
  }

  async update(companyId: string, id: string, dto: UpdateLocationDto) {
    await this.findOne(companyId, id); // Vérifie d'abord l'existence et l'appartenance à la compagnie

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

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id); // Vérifie d'abord l'existence et l'appartenance à la compagnie

    await this.prisma.location.delete({
      where: { id },
    });

    return { success: true };
  }

  async generateQr(companyId: string, id: string) {
    await this.findOne(companyId, id); // Vérifie d'abord l'existence et l'appartenance à la compagnie

    const qrToken = randomUUID();

    const updated = await this.prisma.location.update({
      where: { id },
      data: { qrToken },
    });

    return {
      qr_token: updated.qrToken,
    };
  }

  // Permet d'adapter l'objet de base de données aux propriétés attendues par l'interface frontend
  private mapToSite(loc: any) {
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
}
