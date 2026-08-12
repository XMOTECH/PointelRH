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
exports.DbUserInterceptor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DbUserInterceptor = class DbUserInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
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
};
exports.DbUserInterceptor = DbUserInterceptor;
exports.DbUserInterceptor = DbUserInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DbUserInterceptor);
//# sourceMappingURL=db-user.interceptor.js.map