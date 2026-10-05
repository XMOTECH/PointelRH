import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import { PlanningWeekController } from './controllers/planning-week.controller';
import { WorkShiftController } from './controllers/work-shift.controller';
import { ShiftTemplateController } from './controllers/shift-template.controller';
import { PlanningComplianceService } from './services/planning-compliance.service';
import { PlanningWeekService } from './services/planning-week.service';
import { WorkShiftService } from './services/work-shift.service';
import { ShiftTemplateService } from './services/shift-template.service';

@Module({
  controllers: [
    ScheduleController,
    TimelineController,
    PlanningWeekController,
    WorkShiftController,
    ShiftTemplateController,
  ],
  providers: [
    ScheduleService,
    TimelineService,
    PlanningComplianceService,
    PlanningWeekService,
    WorkShiftService,
    ShiftTemplateService,
  ],
  exports: [
    ScheduleService,
    TimelineService,
    PlanningComplianceService,
    PlanningWeekService,
    WorkShiftService,
    ShiftTemplateService,
  ],
})
export class ScheduleModule {}
