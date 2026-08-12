import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DbUserInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    
    // Keycloak Connect populates request.user with decoded JWT claims
    if (request.user) {
      const email = request.user.email || request.user.preferred_username;
      
      if (email) {
        const dbUser = await this.prisma.user.findUnique({
          where: { email },
          include: {
            employee: true,
          },
        });
        
        if (dbUser) {
          request.dbUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            companyId: dbUser.companyId,
            employeeId: dbUser.employee?.id || null,
            departmentId: dbUser.departmentId || null,
          };
        }
      }
    }
    
    return next.handle();
  }
}
