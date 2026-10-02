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
exports.PerformanceTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const performance_enums_1 = require("../entities/performance.enums");
let PerformanceTemplateService = class PerformanceTemplateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        return this.prisma.performanceTemplate.create({
            data: {
                companyId,
                title: dto.title,
                description: dto.description,
                category: dto.category || performance_enums_1.TemplateCategory.ANNUAL,
                sections: dto.sections,
                isActive: true,
            },
        });
    }
    async findAll(companyId) {
        let templates = await this.prisma.performanceTemplate.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });
        if (templates.length === 0) {
            await this.seedDefaultTemplates(companyId);
            templates = await this.prisma.performanceTemplate.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
            });
        }
        return templates;
    }
    async findOne(companyId, id) {
        const template = await this.prisma.performanceTemplate.findFirst({
            where: { id, companyId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Modèle d'évaluation avec l'ID ${id} introuvable.`);
        }
        return template;
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        return this.prisma.performanceTemplate.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                sections: dto.sections ? dto.sections : undefined,
            },
        });
    }
    async seedDefaultTemplates(companyId) {
        const standardAnnualTemplate = {
            title: 'Entretien Annuel d\'Évaluation (Standard)',
            description: 'Trame complète pour l\'évaluation annuelle des compétences, des objectifs et des souhaits d\'évolution.',
            category: performance_enums_1.TemplateCategory.ANNUAL,
            sections: [
                {
                    id: 'sec_goals_review',
                    title: '1. Bilan des Objectifs de l\'Année Écoulée',
                    description: 'Évaluation de l\'atteinte des objectifs fixés lors de la période précédente.',
                    weight: 2,
                    questions: [
                        {
                            id: 'q_goals_achievement',
                            label: 'Niveau global d\'atteinte des objectifs quantitatifs et qualitatifs',
                            hint: 'Noter de 1 (Très insuffisant) à 5 (Objectifs dépassés)',
                            type: 'RATING_1_5',
                            isRequired: true,
                        },
                        {
                            id: 'q_goals_comments',
                            label: 'Principaux succès, difficultés rencontrées et facteurs explicatifs',
                            hint: 'Détailler les réalisations majeures et les freins',
                            type: 'TEXT',
                            isRequired: true,
                        },
                    ],
                },
                {
                    id: 'sec_skills',
                    title: '2. Maîtrise des Compétences & Savoir-Être',
                    description: 'Évaluation des compétences clés liées au poste et des attitudes professionnelles.',
                    weight: 2,
                    questions: [
                        {
                            id: 'q_tech_competence',
                            label: 'Expertise technique et qualité du travail fourni',
                            hint: 'Maîtrise des outils, rigueur et conformité aux standards',
                            type: 'RATING_1_5',
                            isRequired: true,
                        },
                        {
                            id: 'q_teamwork',
                            label: 'Communication, esprit d\'équipe et collaboration',
                            hint: 'Partage d\'informations, entraide et écoute active',
                            type: 'RATING_1_5',
                            isRequired: true,
                        },
                        {
                            id: 'q_autonomy',
                            label: 'Autonomie, proactivité et sens des responsabilités',
                            hint: 'Capacité à anticiper et résoudre les problèmes',
                            type: 'RATING_1_5',
                            isRequired: true,
                        },
                    ],
                },
                {
                    id: 'sec_wishes_development',
                    title: '3. Perspectives, Souhaits de Formation et Évolution',
                    description: 'Projections de carrière, besoins d\'accompagnement et développement professionnel.',
                    weight: 1,
                    questions: [
                        {
                            id: 'q_training_wishes',
                            label: 'Formations ou compétences prioritaires souhaitées pour l\'année à venir',
                            hint: 'Formations certifiantes, mentorat ou auto-formation',
                            type: 'TEXT',
                            isRequired: false,
                        },
                        {
                            id: 'q_career_goals',
                            label: 'Souhaits d\'évolution à moyen terme (mobilité, management, spécialisation)',
                            hint: 'Projections à 1-3 ans',
                            type: 'TEXT',
                            isRequired: false,
                        },
                    ],
                },
            ],
        };
        return this.create(companyId, standardAnnualTemplate);
    }
};
exports.PerformanceTemplateService = PerformanceTemplateService;
exports.PerformanceTemplateService = PerformanceTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceTemplateService);
//# sourceMappingURL=performance-template.service.js.map