import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePerformanceTemplateDto } from '../dto/create-performance-template.dto';
import { TemplateCategory } from '../entities/performance.enums';

@Injectable()
export class PerformanceTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePerformanceTemplateDto) {
    return this.prisma.performanceTemplate.create({
      data: {
        companyId,
        title: dto.title,
        description: dto.description,
        category: dto.category || TemplateCategory.ANNUAL,
        sections: dto.sections as any,
        isActive: true,
      },
    });
  }

  async findAll(companyId: string) {
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

  async findOne(companyId: string, id: string) {
    const template = await this.prisma.performanceTemplate.findFirst({
      where: { id, companyId },
    });

    if (!template) {
      throw new NotFoundException(`Modèle d'évaluation avec l'ID ${id} introuvable.`);
    }

    return template;
  }

  async update(companyId: string, id: string, dto: Partial<CreatePerformanceTemplateDto>) {
    await this.findOne(companyId, id);

    return this.prisma.performanceTemplate.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        sections: dto.sections ? (dto.sections as any) : undefined,
      },
    });
  }

  async seedDefaultTemplates(companyId: string) {
    const standardAnnualTemplate: CreatePerformanceTemplateDto = {
      title: 'Entretien Annuel d\'Évaluation (Standard)',
      description: 'Trame complète pour l\'évaluation annuelle des compétences, des objectifs et des souhaits d\'évolution.',
      category: TemplateCategory.ANNUAL,
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
}
