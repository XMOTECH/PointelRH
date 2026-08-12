import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeMeController } from './employee-me.controller';
import { AdvanceService } from './advance.service';
import { AdvanceController } from './advance.controller';

@Module({
  controllers: [EmployeeController, EmployeeMeController, AdvanceController],
  providers: [EmployeeService, AdvanceService],
  exports: [EmployeeService, AdvanceService],
})
export class EmployeeModule {}



