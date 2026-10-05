import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PerformanceAuditService } from './services/performance-audit.service';
import { PerformanceTemplateService } from './services/performance-template.service';
import { PerformanceCampaignService } from './services/performance-campaign.service';
import { PerformanceEvaluationService } from './services/performance-evaluation.service';
import { PerformanceObjectiveService } from './services/performance-objective.service';
import { PerformanceTemplateController } from './controllers/performance-template.controller';
import { PerformanceCampaignController } from './controllers/performance-campaign.controller';
import { PerformanceEvaluationController } from './controllers/performance-evaluation.controller';
import { PerformanceObjectiveController } from './controllers/performance-objective.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    PerformanceTemplateController,
    PerformanceCampaignController,
    PerformanceEvaluationController,
    PerformanceObjectiveController,
  ],
  providers: [
    PerformanceAuditService,
    PerformanceTemplateService,
    PerformanceCampaignService,
    PerformanceEvaluationService,
    PerformanceObjectiveService,
  ],
  exports: [
    PerformanceCampaignService,
    PerformanceEvaluationService,
    PerformanceObjectiveService,
    PerformanceTemplateService,
  ],
})
export class PerformanceModule {}
