import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, dto: CreateLocationDto): Promise<{
        id: any;
        name: any;
        address: any;
        latitude: any;
        longitude: any;
        radius_meters: any;
        is_active: any;
        qr_token: any;
        created_at: any;
        updated_at: any;
    }>;
    findAll(companyId: string): Promise<{
        id: any;
        name: any;
        address: any;
        latitude: any;
        longitude: any;
        radius_meters: any;
        is_active: any;
        qr_token: any;
        created_at: any;
        updated_at: any;
    }[]>;
    findOne(companyId: string, id: string): Promise<{
        id: any;
        name: any;
        address: any;
        latitude: any;
        longitude: any;
        radius_meters: any;
        is_active: any;
        qr_token: any;
        created_at: any;
        updated_at: any;
    }>;
    update(companyId: string, id: string, dto: UpdateLocationDto): Promise<{
        id: any;
        name: any;
        address: any;
        latitude: any;
        longitude: any;
        radius_meters: any;
        is_active: any;
        qr_token: any;
        created_at: any;
        updated_at: any;
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
    }>;
    generateQr(companyId: string, id: string): Promise<{
        qr_token: string | null;
    }>;
    private mapToSite;
}
