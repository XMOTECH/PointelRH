import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import { PlanningController } from './planning.controller';

@Module({
  controllers: [ScheduleController, TimelineController, PlanningController],
  providers: [ScheduleService, TimelineService],
  exports: [ScheduleService, TimelineService],
})
export class ScheduleModule {}
