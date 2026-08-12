import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { KeycloakAdminService } from './keycloak-admin.service';
export declare class AuthService {
    private readonly prisma;
    private readonly config;
    private readonly keycloakAdmin;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, keycloakAdmin: KeycloakAdminService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            company_id: string;
            employee_id: string | null;
            department_id: string | null;
            is_active: true;
            permissions: string[];
        };
    }>;
    verify(email: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            company_id: string;
            employee_id: string | null;
            department_id: string | null;
            is_active: true;
            permissions: string[];
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: any;
        refresh_token: any;
        expires_in: any;
        token_type: any;
    }>;
    private getRolePermissions;
}
