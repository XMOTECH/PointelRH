import { Module } from '@nestjs/common';
import { MissionService } from './mission.service';
import { MissionController } from './mission.controller';
import { EmployeeMissionController } from './employee-mission.controller';

@Module({
  controllers: [MissionController, EmployeeMissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
