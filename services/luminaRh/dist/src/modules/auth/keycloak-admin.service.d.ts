import { ConfigService } from '@nestjs/config';
export declare class KeycloakAdminService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    private getAdminToken;
    createUser(payload: {
        email: string;
        firstName: string;
        lastName: string;
        tempPassword: string;
        role: string;
    }): Promise<string>;
    resetUserCredentials(email: string, newPassword?: string): Promise<string | null>;
}
