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
var KeycloakAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakAdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let KeycloakAdminService = KeycloakAdminService_1 = class KeycloakAdminService {
    config;
    logger = new common_1.Logger(KeycloakAdminService_1.name);
    constructor(config) {
        this.config = config;
    }
    async getAdminToken() {
        const defaultUrl = process.env.NODE_ENV === 'production' ? 'http://keycloak:8080' : (this.config.get('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080');
        const adminUser = this.config.get('KEYCLOAK_ADMIN_USER', 'admin');
        const adminPass = this.config.get('KEYCLOAK_ADMIN_PASS', 'admin');
        const urlsToTry = [
            defaultUrl,
            'http://keycloak:8080',
            'http://localhost:8085',
        ].filter((v, i, a) => a.indexOf(v) === i);
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', 'admin-cli');
        params.append('username', adminUser);
        params.append('password', adminPass);
        for (const authServerUrl of urlsToTry) {
            const tokenUrl = `${authServerUrl}/realms/master/protocol/openid-connect/token`;
            try {
                const response = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                    signal: AbortSignal.timeout(2000),
                });
                if (response.ok) {
                    const data = await response.json();
                    return data.access_token;
                }
            }
            catch (err) {
                this.logger.debug(`Keycloak master token attempt failed on ${authServerUrl}: ${err}`);
            }
        }
        throw new common_1.InternalServerErrorException('Impossible d\'obtenir le token d\'administration Keycloak');
    }
    async createUser(payload) {
        const authServerUrl = this.config.get('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080';
        const realm = this.config.get('KEYCLOAK_REALM', 'luminarh');
        const adminToken = await this.getAdminToken();
        const createUserUrl = `${authServerUrl}/admin/realms/${realm}/users`;
        const userPayload = {
            username: payload.email,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            enabled: true,
            emailVerified: true,
            requiredActions: [],
            credentials: [
                {
                    type: 'password',
                    value: payload.tempPassword,
                    temporary: false,
                },
            ],
        };
        let userId;
        try {
            const response = await fetch(createUserUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userPayload),
                signal: AbortSignal.timeout(2500),
            });
            if (!response.ok) {
                const errText = await response.text();
                this.logger.error(`Failed to create user in Keycloak: ${errText}`);
                if (response.status === 409) {
                    this.logger.log(`Réinitialisation du compte Keycloak existant pour ${payload.email}`);
                    const resetId = await this.resetUserCredentials(payload.email, payload.tempPassword);
                    if (resetId)
                        return resetId;
                }
                throw new common_1.InternalServerErrorException('Erreur lors de la création du compte dans Keycloak');
            }
            const location = response.headers.get('Location');
            if (!location) {
                throw new common_1.InternalServerErrorException('ID utilisateur introuvable dans la réponse de Keycloak');
            }
            const parts = location.split('/');
            userId = parts[parts.length - 1];
        }
        catch (error) {
            this.logger.error(`Error creating user in Keycloak realm ${realm}`, error);
            throw error;
        }
        const rolesUrl = `${authServerUrl}/admin/realms/${realm}/roles`;
        try {
            const response = await fetch(rolesUrl, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                },
            });
            if (!response.ok) {
                throw new common_1.InternalServerErrorException('Impossible de récupérer les rôles de Keycloak');
            }
            const roles = await response.json();
            const targetRole = roles.find((r) => r.name === payload.role);
            if (targetRole) {
                const mapRoleUrl = `${authServerUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;
                const roleMappingResponse = await fetch(mapRoleUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([
                        {
                            id: targetRole.id,
                            name: targetRole.name,
                        },
                    ]),
                });
                if (!roleMappingResponse.ok) {
                    const errText = await roleMappingResponse.text();
                    this.logger.error(`Failed to map role to Keycloak user: ${errText}`);
                }
            }
            else {
                this.logger.warn(`Role ${payload.role} not found in Keycloak realm roles`);
            }
        }
        catch (error) {
            this.logger.error(`Error mapping role to user ${userId}`, error);
        }
        return userId;
    }
    async resetUserCredentials(email, newPassword) {
        try {
            const authServerUrl = this.config.get('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080';
            const realm = this.config.get('KEYCLOAK_REALM', 'luminarh');
            const adminToken = await this.getAdminToken();
            const searchUrl = `${authServerUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}`;
            const searchRes = await fetch(searchUrl, {
                headers: { 'Authorization': `Bearer ${adminToken}` },
            });
            if (!searchRes.ok)
                return null;
            const users = await searchRes.json();
            if (!users || users.length === 0)
                return null;
            const user = users[0];
            const userId = user.id;
            const updateUserUrl = `${authServerUrl}/admin/realms/${realm}/users/${userId}`;
            await fetch(updateUserUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...user,
                    enabled: true,
                    emailVerified: true,
                    requiredActions: [],
                }),
            });
            if (newPassword) {
                const resetPassUrl = `${authServerUrl}/admin/realms/${realm}/users/${userId}/reset-password`;
                await fetch(resetPassUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'password',
                        value: newPassword,
                        temporary: false,
                    }),
                });
            }
            this.logger.log(`Accès Keycloak débloqué avec succès pour ${email}`);
            return userId;
        }
        catch (err) {
            this.logger.error(`Erreur lors du déblocage Keycloak pour ${email}:`, err);
            return null;
        }
    }
};
exports.KeycloakAdminService = KeycloakAdminService;
exports.KeycloakAdminService = KeycloakAdminService = KeycloakAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KeycloakAdminService);
//# sourceMappingURL=keycloak-admin.service.js.map