import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    create(companyId: string, dto: CreateLocationDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    findAll(companyId: string): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    update(companyId: string, id: string, dto: UpdateLocationDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    generateQr(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            qr_token: string | null;
        };
    }>;
}
