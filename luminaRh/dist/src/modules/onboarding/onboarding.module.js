"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const onboarding_template_controller_1 = require("./controllers/onboarding-template.controller");
const onboarding_session_controller_1 = require("./controllers/onboarding-session.controller");
const onboarding_candidate_controller_1 = require("./controllers/onboarding-candidate.controller");
const onboarding_template_service_1 = require("./services/onboarding-template.service");
const onboarding_session_service_1 = require("./services/onboarding-session.service");
const onboarding_document_service_1 = require("./services/onboarding-document.service");
const onboarding_audit_service_1 = require("./services/onboarding-audit.service");
let OnboardingModule = class OnboardingModule {
};
exports.OnboardingModule = OnboardingModule;
exports.OnboardingModule = OnboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            onboarding_template_controller_1.OnboardingTemplateController,
            onboarding_session_controller_1.OnboardingSessionController,
            onboarding_candidate_controller_1.OnboardingCandidateController,
        ],
        providers: [
            onboarding_template_service_1.OnboardingTemplateService,
            onboarding_session_service_1.OnboardingSessionService,
            onboarding_document_service_1.OnboardingDocumentService,
            onboarding_audit_service_1.OnboardingAuditService,
        ],
        exports: [
            onboarding_session_service_1.OnboardingSessionService,
            onboarding_document_service_1.OnboardingDocumentService,
            onboarding_template_service_1.OnboardingTemplateService,
        ],
    })
], OnboardingModule);
//# sourceMappingURL=onboarding.module.js.map