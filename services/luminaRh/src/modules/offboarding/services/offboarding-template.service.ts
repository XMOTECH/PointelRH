import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOffboardingTemplateDto } from '../dto/create-offboarding-template.dto';
import { OffboardingTaskCategory, OffboardingTargetRole } from '../entities/offboarding.enums';

@Injectable()
export class OffboardingTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
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
      // Auto-initialiser le modèle standard pour l'entreprise
      const defaultTemplate = await this.createDefaultTemplate(companyId);
      return [defaultTemplate];
    }

    return templates;
  }

  async findOne(companyId: string, id: string) {
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
      throw new NotFoundException('Modèle d\'offboarding introuvable');
    }

    return template;
  }

  async create(companyId: string, dto: CreateOffboardingTemplateDto) {
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

  async createDefaultTemplate(companyId: string) {
    const defaultTasks = [
      {
        title: 'Restitution du matériel informatique (PC, chargeur, accessoires)',
        category: OffboardingTaskCategory.IT,
        assignedRole: OffboardingTargetRole.IT,
        daysOffset: 0,
        isRequired: true,
        order: 1,
      },
      {
        title: 'Révocation des accès numériques (Email, VPN, logiciels RH)',
        category: OffboardingTaskCategory.SECURITY,
        assignedRole: OffboardingTargetRole.IT,
        daysOffset: 0,
        isRequired: true,
        order: 2,
      },
      {
        title: 'Restitution du badge d\'accès physique et des clés',
        category: OffboardingTaskCategory.SECURITY,
        assignedRole: OffboardingTargetRole.ADMIN,
        daysOffset: 0,
        isRequired: true,
        order: 3,
      },
      {
        title: 'Passation des projets en cours et des dossiers clients',
        category: OffboardingTaskCategory.MANAGER,
        assignedRole: OffboardingTargetRole.MANAGER,
        daysOffset: -3,
        isRequired: true,
        order: 4,
      },
      {
        title: 'Entretien de sortie (Exit Interview)',
        category: OffboardingTaskCategory.MANAGER,
        assignedRole: OffboardingTargetRole.HR,
        daysOffset: -2,
        isRequired: false,
        order: 5,
      },
      {
        title: 'Vérification et apurement des acomptes et notes de frais',
        category: OffboardingTaskCategory.FINANCE,
        assignedRole: OffboardingTargetRole.ADMIN,
        daysOffset: -1,
        isRequired: true,
        order: 6,
      },
      {
        title: 'Établissement du Certificat de Travail et du Reçu pour Solde',
        category: OffboardingTaskCategory.HR,
        assignedRole: OffboardingTargetRole.HR,
        daysOffset: 0,
        isRequired: true,
        order: 7,
      },
      {
        title: 'Radiation des registres sociaux (IPRES, CSS, Mutuelle)',
        category: OffboardingTaskCategory.HR,
        assignedRole: OffboardingTargetRole.HR,
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
}
