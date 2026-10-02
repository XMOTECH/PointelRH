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
var OnboardingTemplateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const onboarding_enums_1 = require("../entities/onboarding.enums");
let OnboardingTemplateService = OnboardingTemplateService_1 = class OnboardingTemplateService {
    prisma;
    logger = new common_1.Logger(OnboardingTemplateService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        const template = await this.prisma.onboardingTemplate.create({
            data: {
                companyId,
                name: dto.name,
                description: dto.description,
                contractType: dto.contractType || 'cdi',
                departmentId: dto.departmentId || null,
                templateTasks: {
                    create: dto.tasks.map((task, idx) => ({
                        title: task.title,
                        description: task.description,
                        category: task.category || onboarding_enums_1.TaskCategory.ADMINISTRATIVE,
                        targetRole: task.targetRole || onboarding_enums_1.TargetRole.CANDIDATE,
                        daysOffset: task.daysOffset ?? 0,
                        isRequired: task.isRequired ?? true,
                        order: task.order ?? idx,
                    })),
                },
            },
            include: {
                templateTasks: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        return template;
    }
    async findAll(companyId) {
        const templates = await this.prisma.onboardingTemplate.findMany({
            where: { companyId, isActive: true },
            include: {
                department: true,
                templateTasks: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (templates.length === 0) {
            await this.seedDefaultTemplates(companyId);
            return this.prisma.onboardingTemplate.findMany({
                where: { companyId, isActive: true },
                include: {
                    department: true,
                    templateTasks: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return templates;
    }
    async findOne(companyId, templateId) {
        const template = await this.prisma.onboardingTemplate.findFirst({
            where: { id: templateId, companyId },
            include: {
                department: true,
                templateTasks: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Modèle d\'onboarding introuvable');
        }
        return template;
    }
    async seedDefaultTemplates(companyId) {
        this.logger.log(`Initialisation des modèles d'onboarding par défaut pour l'entreprise ${companyId}`);
        await this.prisma.onboardingTemplate.create({
            data: {
                companyId,
                name: 'Ouvrier Usine 3x8 & Production Industrielle',
                description: 'Parcours complet pour ouvriers de production, maintenance et caristes (Accentuation HSE, EPI et Kiosque).',
                contractType: 'cdi',
                templateTasks: {
                    create: [
                        {
                            title: 'Dépôt des pièces d\'identité (CNI / NIN & RIB)',
                            description: 'Téléversement de la CNI CEDEAO recto/verso et du RIB pour le virement de la paie.',
                            category: onboarding_enums_1.TaskCategory.ADMINISTRATIVE,
                            targetRole: onboarding_enums_1.TargetRole.CANDIDATE,
                            daysOffset: -10,
                            isRequired: true,
                            order: 1,
                        },
                        {
                            title: 'Visite médicale d\'aptitude au travail posté (Médecine du travail)',
                            description: 'Examen médical d\'aptitude obligatoire avant toute prise de poste en usine (travail de nuit 3x8 et poussière).',
                            category: onboarding_enums_1.TaskCategory.HSE_SECURITY,
                            targetRole: onboarding_enums_1.TargetRole.HSE_OFFICER,
                            daysOffset: -5,
                            isRequired: true,
                            order: 2,
                        },
                        {
                            title: 'Dotation Paquetage EPI & Attribution Casier',
                            description: 'Remise des chaussures de sécurité, casque de chantier, gilet haute visibilité, gants et clé de casier.',
                            category: onboarding_enums_1.TaskCategory.HSE_SECURITY,
                            targetRole: onboarding_enums_1.TargetRole.HSE_OFFICER,
                            daysOffset: -2,
                            isRequired: true,
                            order: 3,
                        },
                        {
                            title: 'Génération du Code PIN Kiosque & Enrôlement facial',
                            description: 'Création du code PIN à 4 chiffres et capture du descripteur facial pour le pointage biométrique.',
                            category: onboarding_enums_1.TaskCategory.IT_ACCESS,
                            targetRole: onboarding_enums_1.TargetRole.HR_ADMIN,
                            daysOffset: 0,
                            isRequired: true,
                            order: 4,
                        },
                        {
                            title: 'Briefing sécurité usine (Induction HSE) & Accueil Tuteur',
                            description: 'Sensibilisation aux consignes de sécurité sur site et prise en main avec le chef d\'équipe.',
                            category: onboarding_enums_1.TaskCategory.TRAINING,
                            targetRole: onboarding_enums_1.TargetRole.MANAGER,
                            daysOffset: 0,
                            isRequired: true,
                            order: 5,
                        },
                        {
                            title: 'Bilan intermédiaire de Période d\'Essai (1er Mois)',
                            description: 'Entretien d\'évaluation à 30 jours entre le collaborateur et son responsable hiérarchique.',
                            category: onboarding_enums_1.TaskCategory.ADMINISTRATIVE,
                            targetRole: onboarding_enums_1.TargetRole.MANAGER,
                            daysOffset: 30,
                            isRequired: true,
                            order: 6,
                        },
                    ],
                },
            },
        });
        await this.prisma.onboardingTemplate.create({
            data: {
                companyId,
                name: 'Cadre & Fonctions Support (Siège)',
                description: 'Parcours pour managers, ingénieurs et administratifs (Accentuation informatique et accès SI).',
                contractType: 'cdi',
                templateTasks: {
                    create: [
                        {
                            title: 'Dossier administratif & Justificatifs fiscaux',
                            description: 'Fourniture CNI, RIB, diplômes et composition familiale pour les parts fiscales.',
                            category: onboarding_enums_1.TaskCategory.ADMINISTRATIVE,
                            targetRole: onboarding_enums_1.TargetRole.CANDIDATE,
                            daysOffset: -10,
                            isRequired: true,
                            order: 1,
                        },
                        {
                            title: 'Provisioning Compte Keycloak & Email professionnel',
                            description: 'Création des accès informatiques, boîte mail et droits d\'accès au SIRH LuminaRH.',
                            category: onboarding_enums_1.TaskCategory.IT_ACCESS,
                            targetRole: onboarding_enums_1.TargetRole.IT_ADMIN,
                            daysOffset: -3,
                            isRequired: true,
                            order: 2,
                        },
                        {
                            title: 'Signature du contrat et du règlement intérieur',
                            description: 'Signature formelle du contrat de travail et remise du livret d\'accueil.',
                            category: onboarding_enums_1.TaskCategory.LEGAL,
                            targetRole: onboarding_enums_1.TargetRole.HR_ADMIN,
                            daysOffset: 0,
                            isRequired: true,
                            order: 3,
                        },
                        {
                            title: 'Entretien de bilan de période d\'essai (3ème Mois)',
                            description: 'Évaluation finale avant confirmation de titularisation en CDI.',
                            category: onboarding_enums_1.TaskCategory.ADMINISTRATIVE,
                            targetRole: onboarding_enums_1.TargetRole.MANAGER,
                            daysOffset: 90,
                            isRequired: true,
                            order: 4,
                        },
                    ],
                },
            },
        });
    }
};
exports.OnboardingTemplateService = OnboardingTemplateService;
exports.OnboardingTemplateService = OnboardingTemplateService = OnboardingTemplateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OnboardingTemplateService);
//# sourceMappingURL=onboarding-template.service.js.map