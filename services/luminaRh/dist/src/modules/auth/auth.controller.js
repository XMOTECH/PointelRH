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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const keycloak_admin_service_1 = require("./keycloak-admin.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
let AuthController = AuthController_1 = class AuthController {
    authService;
    keycloakAdmin;
    eventEmitter;
    prisma;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService, keycloakAdmin, eventEmitter, prisma) {
        this.authService = authService;
        this.keycloakAdmin = keycloakAdmin;
        this.eventEmitter = eventEmitter;
        this.prisma = prisma;
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async verify(user, authHeader) {
        if (user && user.id) {
            return {
                success: true,
                data: { user },
            };
        }
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                const email = payload.email || payload.preferred_username;
                if (email) {
                    const result = await this.authService.verify(email);
                    return {
                        success: true,
                        data: result,
                    };
                }
            }
            catch {
            }
        }
        throw new common_1.UnauthorizedException('Session expirée ou invalide');
    }
    async refresh(refreshToken, headerRefresh) {
        const token = refreshToken || headerRefresh;
        if (!token) {
            throw new common_1.UnauthorizedException('Refresh token manquant');
        }
        return this.authService.refreshToken(token);
    }
    async logout() {
        return { success: true, message: 'Déconnexion réussie' };
    }
    async createUser(body) {
        const tempPassword = (0, crypto_1.randomBytes)(8).toString('hex') + 'A1!';
        const nameParts = (body.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || 'Prénom';
        const lastName = nameParts.slice(1).join(' ') || 'Nom';
        try {
            await this.keycloakAdmin.createUser({
                email: body.email,
                firstName,
                lastName,
                tempPassword,
                role: body.role || 'employee',
            });
        }
        catch (err) {
            this.logger.error(`[KeycloakAdmin] Création utilisateur Keycloak ignorée ou déjà existante:`, err);
        }
        const employee = await this.prisma.employee.findFirst({
            where: { email: body.email },
            include: {
                department: true,
                schedule: true,
            },
        });
        this.eventEmitter.emit('employee.created', {
            employee: employee || {
                firstName,
                lastName,
                email: body.email,
            },
            password: tempPassword,
        });
        return {
            success: true,
            message: 'Compte utilisateur créé dans Keycloak avec succès',
            data: {
                email: body.email,
                role: body.role || 'employee',
                temp_password: tempPassword,
            },
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Connexion de l\'utilisateur',
        description: 'Valide les identifiants de l\'utilisateur contre Keycloak (Direct Grant) et renvoie un JWT d\'accès accompagné des données du profil.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Identifiants invalides.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Vérifier la session et le token de l\'utilisateur',
        description: 'Valide le token d\'accès JWT fourni et renvoie les données de profil utilisateur associées pour restaurer sa session.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session valide.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session non authentifiée ou expirée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rafraîchir le token d\'accès JWT' }),
    __param(0, (0, common_1.Body)('refresh_token')),
    __param(1, (0, common_1.Headers)('x-refresh-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Déconnexion' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:super_admin'] }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un compte utilisateur (compatibilité)',
        description: 'Dans le monolithe, le compte utilisateur est déjà créé lors de la création de l\'employé. Ce endpoint retourne un succès pour la compatibilité du frontend.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Utilisateur créé (ou déjà existant).' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        keycloak_admin_service_1.KeycloakAdminService,
        event_emitter_1.EventEmitter2,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map