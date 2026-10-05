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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const keycloak_admin_service_1 = require("./keycloak-admin.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    config;
    keycloakAdmin;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, config, keycloakAdmin) {
        this.prisma = prisma;
        this.config = config;
        this.keycloakAdmin = keycloakAdmin;
    }
    async login(loginDto) {
        const authServerUrl = this.config.get('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080');
        const realm = this.config.get('KEYCLOAK_REALM', 'luminarh');
        const rawClientId = this.config.get('KEYCLOAK_CLIENT_ID', 'luminarh-backend');
        const clientId = rawClientId ? rawClientId.replace(/^["']|["']$/g, '').trim() : 'luminarh-backend';
        const rawSecret = this.config.get('KEYCLOAK_CLIENT_SECRET', '');
        const clientSecret = rawSecret ? rawSecret.replace(/^["']|["']$/g, '').trim() : undefined;
        const tokenUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', clientId);
        if (clientSecret) {
            params.append('client_secret', clientSecret);
        }
        params.append('username', loginDto.email);
        params.append('password', loginDto.password);
        params.append('scope', 'openid profile email');
        let tokenResponse;
        try {
            const fetchToken = async () => {
                const authHeaders = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                if (clientSecret) {
                    authHeaders['Authorization'] = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                }
                let res = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: authHeaders,
                    body: params.toString(),
                });
                if (!res.ok) {
                    const bodyParams = new URLSearchParams(params);
                    if (clientSecret) {
                        bodyParams.append('client_secret', clientSecret);
                    }
                    const bodyResponse = await fetch(tokenUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: bodyParams.toString(),
                    });
                    if (bodyResponse.ok) {
                        res = bodyResponse;
                    }
                }
                return res;
            };
            let response = await fetchToken();
            if (!response.ok) {
                const errText = await response.text();
                this.logger.error('Keycloak token error:', errText);
                if (errText.includes('Account is not fully set up')) {
                    this.logger.log(`Tentative de déblocage automatique de l'accès Keycloak pour ${loginDto.email}...`);
                    await this.keycloakAdmin.resetUserCredentials(loginDto.email, loginDto.password);
                    response = await fetchToken();
                }
            }
            if (!response.ok) {
                throw new common_1.UnauthorizedException('Identifiants invalides');
            }
            tokenResponse = (await response.json());
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error('Keycloak connection error:', error);
            throw new common_1.UnauthorizedException('Impossible de se connecter au serveur d\'authentification');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: {
                company: true,
                employee: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Aucun compte associé à cet email dans la base de données');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Compte désactivé');
        }
        const mappedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company_id: user.companyId,
            employee_id: user.employee?.id || null,
            department_id: user.departmentId || null,
            is_active: user.isActive,
            permissions: this.getRolePermissions(user.role),
        };
        return {
            access_token: tokenResponse.access_token,
            token_type: 'bearer',
            expires_in: tokenResponse.expires_in,
            refresh_token: tokenResponse.refresh_token,
            user: mappedUser,
        };
    }
    async verify(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                company: true,
                employee: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Aucun compte associé à cet email dans la base de données');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Compte désactivé');
        }
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company_id: user.companyId,
                employee_id: user.employee?.id || null,
                department_id: user.departmentId || null,
                is_active: user.isActive,
                permissions: this.getRolePermissions(user.role),
            },
        };
    }
    async refreshToken(refreshToken) {
        const authServerUrl = this.config.get('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080');
        const realm = this.config.get('KEYCLOAK_REALM', 'luminarh');
        const rawClientId = this.config.get('KEYCLOAK_CLIENT_ID', 'luminarh-backend');
        const clientId = rawClientId ? rawClientId.replace(/^["']|["']$/g, '').trim() : 'luminarh-backend';
        const rawSecret = this.config.get('KEYCLOAK_CLIENT_SECRET', '');
        const clientSecret = rawSecret ? rawSecret.replace(/^["']|["']$/g, '').trim() : undefined;
        const tokenUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', clientId);
        if (clientSecret) {
            params.append('client_secret', clientSecret);
        }
        params.append('refresh_token', refreshToken);
        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });
            if (!response.ok) {
                const errText = await response.text();
                this.logger.error('Keycloak refresh token error:', errText);
                throw new common_1.UnauthorizedException('Session expirée, veuillez vous reconnecter');
            }
            const data = await response.json();
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                token_type: data.token_type || 'bearer',
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error('Keycloak refresh error:', error);
            throw new common_1.UnauthorizedException('Impossible de rafraîchir la session');
        }
    }
    getRolePermissions(role) {
        if (role === 'super_admin') {
            return ['all'];
        }
        if (role === 'admin') {
            return ['manage_employees', 'manage_departments', 'view_reports', 'manage_locations'];
        }
        return ['view_own_attendance', 'clock_in_out'];
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        keycloak_admin_service_1.KeycloakAdminService])
], AuthService);
//# sourceMappingURL=auth.service.js.map