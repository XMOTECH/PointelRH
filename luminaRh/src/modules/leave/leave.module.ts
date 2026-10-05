import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { EmployeeLeaveController } from './employee-leave.controller';
import { LeaveTypeController } from './leave-type.controller';

@Module({
  controllers: [LeaveController, EmployeeLeaveController, LeaveTypeController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
