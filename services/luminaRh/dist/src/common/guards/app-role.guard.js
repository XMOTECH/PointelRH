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
exports.AppRoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
let AppRoleGuard = class AppRoleGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            return true;
        const rolesMeta = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!rolesMeta)
            return true;
        const rawRoles = Array.isArray(rolesMeta)
            ? rolesMeta
            : Array.isArray(rolesMeta?.roles)
                ? rolesMeta.roles
                : typeof rolesMeta === 'string'
                    ? [rolesMeta]
                    : [];
        if (rawRoles.length === 0)
            return true;
        const requiredRoles = rawRoles.map((r) => String(r).replace(/^realm:/, '').toLowerCase());
        const userRealmRoles = (user.realm_access?.roles || []).map((r) => String(r).toLowerCase());
        const hasKeycloakRole = requiredRoles.some((role) => userRealmRoles.includes(role));
        if (hasKeycloakRole)
            return true;
        const email = user.email || user.preferred_username;
        if (email) {
            const dbUser = await this.prisma.user.findUnique({
                where: { email },
                select: { role: true, isActive: true },
            });
            if (dbUser && dbUser.isActive) {
                const userDbRole = (dbUser.role || 'employee').toLowerCase();
                if (userDbRole === 'super_admin' ||
                    userDbRole === 'admin' ||
                    requiredRoles.includes(userDbRole) ||
                    (requiredRoles.includes('employee') && (userDbRole === 'employee' || userDbRole === 'manager'))) {
                    return true;
                }
            }
        }
        if (requiredRoles.includes('employee')) {
            return true;
        }
        return false;
    }
};
exports.AppRoleGuard = AppRoleGuard;
exports.AppRoleGuard = AppRoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], AppRoleGuard);
//# sourceMappingURL=app-role.guard.js.map