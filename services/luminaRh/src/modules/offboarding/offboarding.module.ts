import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OffboardingAuditService } from './services/offboarding-audit.service';
import { OffboardingTemplateService } from './services/offboarding-template.service';
import { OffboardingSessionService } from './services/offboarding-session.service';
import { OffboardingTemplateController } from './controllers/offboarding-template.controller';
import { OffboardingSessionController } from './controllers/offboarding-session.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    OffboardingTemplateController,
    OffboardingSessionController,
  ],
  providers: [
    OffboardingAuditService,
    OffboardingTemplateService,
    OffboardingSessionService,
  ],
  exports: [
    OffboardingSessionService,
    OffboardingTemplateService,
  ],
})
export class OffboardingModule {}
