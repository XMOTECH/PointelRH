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
exports.AdvanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdvanceService = class AdvanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(employeeId, amount, type, reason) {
        if (type !== 'advance' && type !== 'loan') {
            throw new common_1.BadRequestException('Le type de demande doit être "advance" ou "loan"');
        }
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        const baseSalaryNum = Number(employee.baseSalary);
        if (type === 'advance' && baseSalaryNum > 0 && amount > baseSalaryNum * 0.5) {
            throw new common_1.BadRequestException('Le montant de l\'acompte ne peut pas dépasser 50% du salaire de base');
        }
        return this.prisma.advanceRequest.create({
            data: {
                employeeId,
                amount,
                type,
                reason,
                status: 'pending',
                repaid: false,
            },
            include: {
                employee: true,
            },
        });
    }
    async findAllForEmployee(employeeId) {
        const list = await this.prisma.advanceRequest.findMany({
            where: { employeeId },
            include: {
                employee: {
                    include: { department: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return list.map((r) => ({
            ...r,
            amount: Number(r.amount),
        }));
    }
    async findAll(companyId) {
        const list = await this.prisma.advanceRequest.findMany({
            where: companyId
                ? {
                    employee: { companyId },
                }
                : {},
            include: {
                employee: {
                    include: { department: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return list.map((r) => ({
            ...r,
            amount: Number(r.amount),
        }));
    }
    async updateStatus(id, status, companyId) {
        if (status !== 'approved' && status !== 'rejected') {
            throw new common_1.BadRequestException('Le statut doit être "approved" ou "rejected"');
        }
        const request = await this.prisma.advanceRequest.findFirst({
            where: {
                id,
                ...(companyId ? { employee: { companyId } } : {}),
            },
            include: { employee: true },
        });
        if (!request) {
            throw new common_1.NotFoundException('Demande d\'acompte introuvable dans votre entreprise');
        }
        return this.prisma.advanceRequest.update({
            where: { id },
            data: { status },
            include: {
                employee: true,
            },
        });
    }
};
exports.AdvanceService = AdvanceService;
exports.AdvanceService = AdvanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdvanceService);
//# sourceMappingURL=advance.service.js.map