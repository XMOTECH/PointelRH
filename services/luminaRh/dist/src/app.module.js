"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const employee_module_1 = require("./modules/employee/employee.module");
const pointage_module_1 = require("./modules/pointage/pointage.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const notification_module_1 = require("./modules/notification/notification.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const location_module_1 = require("./modules/location/location.module");
const task_module_1 = require("./modules/task/task.module");
const mission_module_1 = require("./modules/mission/mission.module");
const leave_module_1 = require("./modules/leave/leave.module");
const department_module_1 = require("./modules/department/department.module");
const schedule_module_1 = require("./modules/schedule/schedule.module");
const payroll_module_1 = require("./modules/payroll/payroll.module");
const onboarding_module_1 = require("./modules/onboarding/onboarding.module");
const offboarding_module_1 = require("./modules/offboarding/offboarding.module");
const performance_module_1 = require("./modules/performance/performance.module");
const db_user_interceptor_1 = require("./common/interceptors/db-user.interceptor");
const case_conversion_interceptor_1 = require("./common/interceptors/case-conversion.interceptor");
const app_role_guard_1 = require("./common/guards/app-role.guard");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            employee_module_1.EmployeeModule,
            pointage_module_1.PointageModule,
            notification_module_1.NotificationModule,
            analytics_module_1.AnalyticsModule,
            location_module_1.LocationModule,
            task_module_1.TaskModule,
            mission_module_1.MissionModule,
            leave_module_1.LeaveModule,
            department_module_1.DepartmentModule,
            schedule_module_1.ScheduleModule,
            payroll_module_1.PayrollModule,
            onboarding_module_1.OnboardingModule,
            offboarding_module_1.OffboardingModule,
            performance_module_1.PerformanceModule,
            nest_keycloak_connect_1.KeycloakConnectModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    authServerUrl: config.get('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080'),
                    realm: config.get('KEYCLOAK_REALM', 'luminarh'),
                    clientId: config.get('KEYCLOAK_CLIENT_ID', 'luminarh-backend'),
                    secret: config.get('KEYCLOAK_CLIENT_SECRET', ''),
                    cookieKey: 'KEYCLOAK_JWT',
                    logLevels: ['verbose'],
                    useNestLogger: true,
                    tokenValidation: nest_keycloak_connect_1.TokenValidation.OFFLINE,
                }),
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.AuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.ResourceGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: app_role_guard_1.AppRoleGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: db_user_interceptor_1.DbUserInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: case_conversion_interceptor_1.CaseConversionInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map