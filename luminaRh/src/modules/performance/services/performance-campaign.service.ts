import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePerformanceCampaignDto } from '../dto/create-performance-campaign.dto';
import { CampaignStatus, EvaluationStatus } from '../entities/performance.enums';

@Injectable()
export class PerformanceCampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePerformanceCampaignDto) {
    const template = await this.prisma.performanceTemplate.findFirst({
      where: { id: dto.templateId, companyId },
    });

    if (!template) {
      throw new NotFoundException(`Le modèle d'évaluation avec l'ID ${dto.templateId} n'existe pas.`);
    }

    const campaign = await this.prisma.performanceCampaign.create({
      data: {
        companyId,
        templateId: dto.templateId,
        title: dto.title,
        description: dto.description,
        year: dto.year,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: CampaignStatus.ACTIVE,
      },
    });

    // Select target employees
    const employeeWhere: any = {
      companyId,
      status: 'active',
    };

    if (dto.employeeIds && dto.employeeIds.length > 0) {
      employeeWhere.id = { in: dto.employeeIds };
    } else if (dto.departmentIds && dto.departmentIds.length > 0) {
      employeeWhere.departmentId = { in: dto.departmentIds };
    }

    const employees = await this.prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true, userId: true, departmentId: true },
    });

    if (employees.length === 0) {
      return campaign;
    }

    // Identify evaluators: for each employee, try to assign a manager or HR admin
    // In LuminaRH, users have roles 'manager', 'admin', 'super_admin'
    const managers = await this.prisma.user.findMany({
      where: {
        companyId,
        role: { in: ['manager', 'admin', 'super_admin'] },
      },
      include: { employee: true },
    });

    const defaultManagerEmployeeId =
      managers.find((m) => m.employee)?.employee?.id || employees[0].id;

    const evaluationData = employees.map((emp) => {
      // Find a manager in the same department if possible, or default
      const deptManager = managers.find(
        (m) => m.departmentId === emp.departmentId && m.employee?.id && m.employee.id !== emp.id,
      );
      const evaluatorId = deptManager?.employee?.id || defaultManagerEmployeeId;

      return {
        companyId,
        campaignId: campaign.id,
        employeeId: emp.id,
        evaluatorId: evaluatorId === emp.id ? (defaultManagerEmployeeId !== emp.id ? defaultManagerEmployeeId : emp.id) : evaluatorId,
        status: EvaluationStatus.NOT_STARTED,
      };
    });

    await this.prisma.performanceEvaluation.createMany({
      data: evaluationData,
      skipDuplicates: true,
    });

    return this.findOne(companyId, campaign.id);
  }

  async findAll(companyId: string) {
    const campaigns = await this.prisma.performanceCampaign.findMany({
      where: { companyId },
      include: {
        template: {
          select: { id: true, title: true, category: true },
        },
        _count: {
          select: { evaluations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns;
  }

  async findOne(companyId: string, id: string) {
    const campaign = await this.prisma.performanceCampaign.findFirst({
      where: { id, companyId },
      include: {
        template: true,
        evaluations: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                jobTitle: true,
                department: { select: { id: true, name: true } },
              },
            },
            evaluator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campagne d'évaluation avec l'ID ${id} introuvable.`);
    }

    const total = campaign.evaluations.length;
    const completed = campaign.evaluations.filter((e) => e.status === EvaluationStatus.COMPLETED).length;
    const inProgress = campaign.evaluations.filter(
      (e) =>
        e.status === EvaluationStatus.SELF_EVALUATION ||
        e.status === EvaluationStatus.MANAGER_REVIEW ||
        e.status === EvaluationStatus.CALIBRATION,
    ).length;
    const notStarted = campaign.evaluations.filter((e) => e.status === EvaluationStatus.NOT_STARTED).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...campaign,
      stats: {
        total,
        completed,
        inProgress,
        notStarted,
        completionRate,
      },
    };
  }

  async closeCampaign(companyId: string, id: string) {
    await this.findOne(companyId, id);

    return this.prisma.performanceCampaign.update({
      where: { id },
      data: { status: CampaignStatus.CLOSED },
    });
  }

  async getGlobalStats(companyId: string) {
    const totalCampaigns = await this.prisma.performanceCampaign.count({
      where: { companyId },
    });

    const evaluations = await this.prisma.performanceEvaluation.findMany({
      where: { companyId },
      select: { status: true, finalRating: true },
    });

    const totalEvaluations = evaluations.length;
    const completedEvaluations = evaluations.filter((e) => e.status === EvaluationStatus.COMPLETED).length;
    const activeEvaluations = evaluations.filter(
      (e) =>
        e.status === EvaluationStatus.SELF_EVALUATION ||
        e.status === EvaluationStatus.MANAGER_REVIEW ||
        e.status === EvaluationStatus.CALIBRATION,
    ).length;

    const ratingsWithScore = evaluations
      .filter((e) => e.finalRating !== null && e.finalRating !== undefined)
      .map((e) => e.finalRating as number);

    const averageRating =
      ratingsWithScore.length > 0
        ? Number((ratingsWithScore.reduce((a, b) => a + b, 0) / ratingsWithScore.length).toFixed(2))
        : null;

    const completionRate = totalEvaluations > 0 ? Math.round((completedEvaluations / totalEvaluations) * 100) : 0;

    return {
      totalCampaigns,
      totalEvaluations,
      completedEvaluations,
      activeEvaluations,
      averageRating,
      completionRate,
    };
  }
}
