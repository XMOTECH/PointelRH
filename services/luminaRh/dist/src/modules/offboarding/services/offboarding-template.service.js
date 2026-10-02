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
exports.OffboardingTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const offboarding_enums_1 = require("../entities/offboarding.enums");
let OffboardingTemplateService = class OffboardingTemplateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId) {
        const templates = await this.prisma.offboardingTemplate.findMany({
            where: { companyId, isActive: true },
            include: {
                templateTasks: {
                    orderBy: { order: 'asc' },
                },
                department: true,
            },
        });
        if (templates.length === 0) {
            const defaultTemplate = await this.createDefaultTemplate(companyId);
            return [defaultTemplate];
        }
        return templates;
    }
    async findOne(companyId, id) {
        const template = await this.prisma.offboardingTemplate.findFirst({
            where: { id, companyId },
            include: {
                templateTasks: {
                    orderBy: { order: 'asc' },
                },
                department: true,
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Modèle d\'offboarding introuvable');
        }
        return template;
    }
    async create(companyId, dto) {
        return this.prisma.offboardingTemplate.create({
            data: {
                companyId,
                name: dto.name,
                description: dto.description,
                departureType: dto.departureType,
                departmentId: dto.departmentId || null,
                templateTasks: {
                    create: (dto.tasks || []).map((t, idx) => ({
                        title: t.title,
                        description: t.description,
                        category: t.category,
                        assignedRole: t.assignedRole,
                        daysOffset: t.daysOffset ?? 0,
                        isRequired: t.isRequired ?? true,
                        order: t.order ?? idx,
                    })),
                },
            },
            include: {
                templateTasks: true,
            },
        });
    }
    async createDefaultTemplate(companyId) {
        const defaultTasks = [
            {
                title: 'Restitution du matériel informatique (PC, chargeur, accessoires)',
                category: offboarding_enums_1.OffboardingTaskCategory.IT,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.IT,
                daysOffset: 0,
                isRequired: true,
                order: 1,
            },
            {
                title: 'Révocation des accès numériques (Email, VPN, logiciels RH)',
                category: offboarding_enums_1.OffboardingTaskCategory.SECURITY,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.IT,
                daysOffset: 0,
                isRequired: true,
                order: 2,
            },
            {
                title: 'Restitution du badge d\'accès physique et des clés',
                category: offboarding_enums_1.OffboardingTaskCategory.SECURITY,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.ADMIN,
                daysOffset: 0,
                isRequired: true,
                order: 3,
            },
            {
                title: 'Passation des projets en cours et des dossiers clients',
                category: offboarding_enums_1.OffboardingTaskCategory.MANAGER,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.MANAGER,
                daysOffset: -3,
                isRequired: true,
                order: 4,
            },
            {
                title: 'Entretien de sortie (Exit Interview)',
                category: offboarding_enums_1.OffboardingTaskCategory.MANAGER,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.HR,
                daysOffset: -2,
                isRequired: false,
                order: 5,
            },
            {
                title: 'Vérification et apurement des acomptes et notes de frais',
                category: offboarding_enums_1.OffboardingTaskCategory.FINANCE,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.ADMIN,
                daysOffset: -1,
                isRequired: true,
                order: 6,
            },
            {
                title: 'Établissement du Certificat de Travail et du Reçu pour Solde',
                category: offboarding_enums_1.OffboardingTaskCategory.HR,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.HR,
                daysOffset: 0,
                isRequired: true,
                order: 7,
            },
            {
                title: 'Radiation des registres sociaux (IPRES, CSS, Mutuelle)',
                category: offboarding_enums_1.OffboardingTaskCategory.HR,
                assignedRole: offboarding_enums_1.OffboardingTargetRole.HR,
                daysOffset: 5,
                isRequired: true,
                order: 8,
            },
        ];
        return this.prisma.offboardingTemplate.create({
            data: {
                companyId,
                name: 'Départ Standard Entreprise',
                description: 'Checklist standard complète applicable pour toute fin de collaboration.',
                templateTasks: {
                    create: defaultTasks,
                },
            },
            include: {
                templateTasks: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
};
exports.OffboardingTemplateService = OffboardingTemplateService;
exports.OffboardingTemplateService = OffboardingTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffboardingTemplateService);
//# sourceMappingURL=offboarding-template.service.js.map