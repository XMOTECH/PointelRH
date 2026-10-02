"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const performance_audit_service_1 = require("./services/performance-audit.service");
const performance_template_service_1 = require("./services/performance-template.service");
const performance_campaign_service_1 = require("./services/performance-campaign.service");
const performance_evaluation_service_1 = require("./services/performance-evaluation.service");
const performance_objective_service_1 = require("./services/performance-objective.service");
const performance_template_controller_1 = require("./controllers/performance-template.controller");
const performance_campaign_controller_1 = require("./controllers/performance-campaign.controller");
const performance_evaluation_controller_1 = require("./controllers/performance-evaluation.controller");
const performance_objective_controller_1 = require("./controllers/performance-objective.controller");
let PerformanceModule = class PerformanceModule {
};
exports.PerformanceModule = PerformanceModule;
exports.PerformanceModule = PerformanceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            performance_template_controller_1.PerformanceTemplateController,
            performance_campaign_controller_1.PerformanceCampaignController,
            performance_evaluation_controller_1.PerformanceEvaluationController,
            performance_objective_controller_1.PerformanceObjectiveController,
        ],
        providers: [
            performance_audit_service_1.PerformanceAuditService,
            performance_template_service_1.PerformanceTemplateService,
            performance_campaign_service_1.PerformanceCampaignService,
            performance_evaluation_service_1.PerformanceEvaluationService,
            performance_objective_service_1.PerformanceObjectiveService,
        ],
        exports: [
            performance_campaign_service_1.PerformanceCampaignService,
            performance_evaluation_service_1.PerformanceEvaluationService,
            performance_objective_service_1.PerformanceObjectiveService,
            performance_template_service_1.PerformanceTemplateService,
        ],
    })
], PerformanceModule);
//# sourceMappingURL=performance.module.js.map