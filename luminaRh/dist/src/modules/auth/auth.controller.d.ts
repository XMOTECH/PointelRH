import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUserDto } from '../../common/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { KeycloakAdminService } from './keycloak-admin.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthController {
    private readonly authService;
    private readonly keycloakAdmin;
    private readonly eventEmitter;
    private readonly prisma;
    private readonly logger;
    constructor(authService: AuthService, keycloakAdmin: KeycloakAdminService, eventEmitter: EventEmitter2, prisma: PrismaService);
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
    verify(user: CurrentUserDto, authHeader?: string): Promise<{
        success: boolean;
        data: {
            user: CurrentUserDto;
        };
    } | {
        success: boolean;
        data: {
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
        };
    }>;
    refresh(refreshToken?: string, headerRefresh?: string): Promise<{
        access_token: any;
        refresh_token: any;
        expires_in: any;
        token_type: any;
    }>;
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
    createUser(body: CreateUserDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            role: string;
            temp_password: string;
        };
    }>;
}
