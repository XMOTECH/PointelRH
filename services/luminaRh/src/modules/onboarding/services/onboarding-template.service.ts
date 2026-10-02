import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { TaskCategory, TargetRole } from '../entities/onboarding.enums';

@Injectable()
export class OnboardingTemplateService {
  private readonly logger = new Logger(OnboardingTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTemplateDto) {
    const template = await (this.prisma as any).onboardingTemplate.create({
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
            category: task.category || TaskCategory.ADMINISTRATIVE,
            targetRole: task.targetRole || TargetRole.CANDIDATE,
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

  async findAll(companyId: string) {
    const templates = await (this.prisma as any).onboardingTemplate.findMany({
      where: { companyId, isActive: true },
      include: {
        department: true,
        templateTasks: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If company has no templates yet, seed industrial default templates
    if (templates.length === 0) {
      await this.seedDefaultTemplates(companyId);
      return (this.prisma as any).onboardingTemplate.findMany({
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

  async findOne(companyId: string, templateId: string) {
    const template = await (this.prisma as any).onboardingTemplate.findFirst({
      where: { id: templateId, companyId },
      include: {
        department: true,
        templateTasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Modèle d\'onboarding introuvable');
    }

    return template;
  }

  /**
   * Seed standard industrial templates for a company (SOCOCIM / West Africa industrial standards)
   */
  async seedDefaultTemplates(companyId: string): Promise<void> {
    this.logger.log(`Initialisation des modèles d'onboarding par défaut pour l'entreprise ${companyId}`);

    // 1. Modèle Usine 3x8 / Production & Maintenance Industrielle
    await (this.prisma as any).onboardingTemplate.create({
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
              category: TaskCategory.ADMINISTRATIVE,
              targetRole: TargetRole.CANDIDATE,
              daysOffset: -10,
              isRequired: true,
              order: 1,
            },
            {
              title: 'Visite médicale d\'aptitude au travail posté (Médecine du travail)',
              description: 'Examen médical d\'aptitude obligatoire avant toute prise de poste en usine (travail de nuit 3x8 et poussière).',
              category: TaskCategory.HSE_SECURITY,
              targetRole: TargetRole.HSE_OFFICER,
              daysOffset: -5,
              isRequired: true,
              order: 2,
            },
            {
              title: 'Dotation Paquetage EPI & Attribution Casier',
              description: 'Remise des chaussures de sécurité, casque de chantier, gilet haute visibilité, gants et clé de casier.',
              category: TaskCategory.HSE_SECURITY,
              targetRole: TargetRole.HSE_OFFICER,
              daysOffset: -2,
              isRequired: true,
              order: 3,
            },
            {
              title: 'Génération du Code PIN Kiosque & Enrôlement facial',
              description: 'Création du code PIN à 4 chiffres et capture du descripteur facial pour le pointage biométrique.',
              category: TaskCategory.IT_ACCESS,
              targetRole: TargetRole.HR_ADMIN,
              daysOffset: 0,
              isRequired: true,
              order: 4,
            },
            {
              title: 'Briefing sécurité usine (Induction HSE) & Accueil Tuteur',
              description: 'Sensibilisation aux consignes de sécurité sur site et prise en main avec le chef d\'équipe.',
              category: TaskCategory.TRAINING,
              targetRole: TargetRole.MANAGER,
              daysOffset: 0,
              isRequired: true,
              order: 5,
            },
            {
              title: 'Bilan intermédiaire de Période d\'Essai (1er Mois)',
              description: 'Entretien d\'évaluation à 30 jours entre le collaborateur et son responsable hiérarchique.',
              category: TaskCategory.ADMINISTRATIVE,
              targetRole: TargetRole.MANAGER,
              daysOffset: 30,
              isRequired: true,
              order: 6,
            },
          ],
        },
      },
    });

    // 2. Modèle Cadre & Fonctions Support / Bureau
    await (this.prisma as any).onboardingTemplate.create({
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
              category: TaskCategory.ADMINISTRATIVE,
              targetRole: TargetRole.CANDIDATE,
              daysOffset: -10,
              isRequired: true,
              order: 1,
            },
            {
              title: 'Provisioning Compte Keycloak & Email professionnel',
              description: 'Création des accès informatiques, boîte mail et droits d\'accès au SIRH LuminaRH.',
              category: TaskCategory.IT_ACCESS,
              targetRole: TargetRole.IT_ADMIN,
              daysOffset: -3,
              isRequired: true,
              order: 2,
            },
            {
              title: 'Signature du contrat et du règlement intérieur',
              description: 'Signature formelle du contrat de travail et remise du livret d\'accueil.',
              category: TaskCategory.LEGAL,
              targetRole: TargetRole.HR_ADMIN,
              daysOffset: 0,
              isRequired: true,
              order: 3,
            },
            {
              title: 'Entretien de bilan de période d\'essai (3ème Mois)',
              description: 'Évaluation finale avant confirmation de titularisation en CDI.',
              category: TaskCategory.ADMINISTRATIVE,
              targetRole: TargetRole.MANAGER,
              daysOffset: 90,
              isRequired: true,
              order: 4,
            },
          ],
        },
      },
    });
  }
}
