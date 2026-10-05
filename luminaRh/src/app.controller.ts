import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Healthcheck utilisé par Docker, le reverse proxy et le pipeline de déploiement.
   * Exposé sur /api/health (préfixe global "api").
   */
  @Public()
  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
    return {
      status: 'ok',
      database: 'up',
      version: process.env.APP_VERSION ?? 'dev',
      uptime: Math.round(process.uptime()),
    };
  }
}
