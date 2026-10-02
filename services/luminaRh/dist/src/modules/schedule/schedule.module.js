"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_service_1 = require("./schedule.service");
const schedule_controller_1 = require("./schedule.controller");
const timeline_service_1 = require("./timeline.service");
const timeline_controller_1 = require("./timeline.controller");
const planning_week_controller_1 = require("./controllers/planning-week.controller");
const work_shift_controller_1 = require("./controllers/work-shift.controller");
const shift_template_controller_1 = require("./controllers/shift-template.controller");
const planning_compliance_service_1 = require("./services/planning-compliance.service");
const planning_week_service_1 = require("./services/planning-week.service");
const work_shift_service_1 = require("./services/work-shift.service");
const shift_template_service_1 = require("./services/shift-template.service");
let ScheduleModule = class ScheduleModule {
};
exports.ScheduleModule = ScheduleModule;
exports.ScheduleModule = ScheduleModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            schedule_controller_1.ScheduleController,
            timeline_controller_1.TimelineController,
            planning_week_controller_1.PlanningWeekController,
            work_shift_controller_1.WorkShiftController,
            shift_template_controller_1.ShiftTemplateController,
        ],
        providers: [
            schedule_service_1.ScheduleService,
            timeline_service_1.TimelineService,
            planning_compliance_service_1.PlanningComplianceService,
            planning_week_service_1.PlanningWeekService,
            work_shift_service_1.WorkShiftService,
            shift_template_service_1.ShiftTemplateService,
        ],
        exports: [
            schedule_service_1.ScheduleService,
            timeline_service_1.TimelineService,
            planning_compliance_service_1.PlanningComplianceService,
            planning_week_service_1.PlanningWeekService,
            work_shift_service_1.WorkShiftService,
            shift_template_service_1.ShiftTemplateService,
        ],
    })
], ScheduleModule);
//# sourceMappingURL=schedule.module.js.map