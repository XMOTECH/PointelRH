import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { 
  KeycloakConnectModule, 
  ResourceGuard, 
  AuthGuard,
  TokenValidation
} from 'nest-keycloak-connect';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { PointageModule } from './modules/pointage/pointage.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationModule } from './modules/notification/notification.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LocationModule } from './modules/location/location.module';
import { TaskModule } from './modules/task/task.module';
import { MissionModule } from './modules/mission/mission.module';
import { LeaveModule } from './modules/leave/leave.module';
import { DepartmentModule } from './modules/department/department.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { OffboardingModule } from './modules/offboarding/offboarding.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { DbUserInterceptor } from './common/interceptors/db-user.interceptor';
import { CaseConversionInterceptor } from './common/interceptors/case-conversion.interceptor';
import { AppRoleGuard } from './common/guards/app-role.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    EmployeeModule,
    PointageModule,
    NotificationModule,
    AnalyticsModule,
    LocationModule,
    TaskModule,
    MissionModule,
    LeaveModule,
    DepartmentModule,
    ScheduleModule,
    PayrollModule,
    OnboardingModule,
    OffboardingModule,
    PerformanceModule,
    KeycloakConnectModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        authServerUrl: config.get<string>('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080'),
        realm: config.get<string>('KEYCLOAK_REALM', 'luminarh'),
        clientId: config.get<string>('KEYCLOAK_CLIENT_ID', 'luminarh-backend'),
        secret: config.get<string>('KEYCLOAK_CLIENT_SECRET', ''),
        cookieKey: 'KEYCLOAK_JWT',
        logLevels: ['verbose'],
        useNestLogger: true,
        tokenValidation: TokenValidation.OFFLINE,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AppRoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DbUserInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CaseConversionInterceptor,
    },
  ],
})
export class AppModule {}
