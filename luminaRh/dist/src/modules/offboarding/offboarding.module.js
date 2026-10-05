"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const offboarding_audit_service_1 = require("./services/offboarding-audit.service");
const offboarding_template_service_1 = require("./services/offboarding-template.service");
const offboarding_session_service_1 = require("./services/offboarding-session.service");
const offboarding_template_controller_1 = require("./controllers/offboarding-template.controller");
const offboarding_session_controller_1 = require("./controllers/offboarding-session.controller");
let OffboardingModule = class OffboardingModule {
};
exports.OffboardingModule = OffboardingModule;
exports.OffboardingModule = OffboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            offboarding_template_controller_1.OffboardingTemplateController,
            offboarding_session_controller_1.OffboardingSessionController,
        ],
        providers: [
            offboarding_audit_service_1.OffboardingAuditService,
            offboarding_template_service_1.OffboardingTemplateService,
            offboarding_session_service_1.OffboardingSessionService,
        ],
        exports: [
            offboarding_session_service_1.OffboardingSessionService,
            offboarding_template_service_1.OffboardingTemplateService,
        ],
    })
], OffboardingModule);
//# sourceMappingURL=offboarding.module.js.map