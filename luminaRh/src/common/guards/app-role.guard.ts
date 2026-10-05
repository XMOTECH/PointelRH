import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return true; // AuthGuard handles basic authentication

    // Get required roles from metadata (set by @Roles decorator)
    const rolesMeta = this.reflector.getAllAndOverride<any>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesMeta) return true;

    // Handle both @Roles({ roles: ['...'] }) and @Roles(['...']) or @Roles('...')
    const rawRoles: string[] = Array.isArray(rolesMeta)
      ? rolesMeta
      : Array.isArray(rolesMeta?.roles)
      ? rolesMeta.roles
      : typeof rolesMeta === 'string'
      ? [rolesMeta]
      : [];

    if (rawRoles.length === 0) return true;

    // Clean required role names (e.g. 'realm:employee' -> 'employee', 'realm:admin' -> 'admin')
    const requiredRoles = rawRoles.map((r: string) => String(r).replace(/^realm:/, '').toLowerCase());

    // 1. Check user's Keycloak roles from JWT
    const userRealmRoles = (user.realm_access?.roles || []).map((r: string) => String(r).toLowerCase());
    const hasKeycloakRole = requiredRoles.some((role) => userRealmRoles.includes(role));
    if (hasKeycloakRole) return true;

    // 2. Check database role (PostgreSQL)
    const email = user.email || user.preferred_username;
    if (email) {
      const dbUser = await this.prisma.user.findUnique({
        where: { email },
        select: { role: true, isActive: true },
      });

      if (dbUser && dbUser.isActive) {
        const userDbRole = (dbUser.role || 'employee').toLowerCase();
        
        if (
          userDbRole === 'super_admin' ||
          userDbRole === 'admin' ||
          requiredRoles.includes(userDbRole) ||
          (requiredRoles.includes('employee') && (userDbRole === 'employee' || userDbRole === 'manager'))
        ) {
          return true;
        }
      }
    }

    // 3. Default: Any authenticated user in the realm is granted standard employee access
    if (requiredRoles.includes('employee')) {
      return true;
    }

    return false;
  }
}
