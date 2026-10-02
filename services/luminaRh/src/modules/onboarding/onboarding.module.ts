import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OnboardingTemplateController } from './controllers/onboarding-template.controller';
import { OnboardingSessionController } from './controllers/onboarding-session.controller';
import { OnboardingCandidateController } from './controllers/onboarding-candidate.controller';
import { OnboardingTemplateService } from './services/onboarding-template.service';
import { OnboardingSessionService } from './services/onboarding-session.service';
import { OnboardingDocumentService } from './services/onboarding-document.service';
import { OnboardingAuditService } from './services/onboarding-audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    OnboardingTemplateController,
    OnboardingSessionController,
    OnboardingCandidateController,
  ],
  providers: [
    OnboardingTemplateService,
    OnboardingSessionService,
    OnboardingDocumentService,
    OnboardingAuditService,
  ],
  exports: [
    OnboardingSessionService,
    OnboardingDocumentService,
    OnboardingTemplateService,
  ],
})
export class OnboardingModule {}
