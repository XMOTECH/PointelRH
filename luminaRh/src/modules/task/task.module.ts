import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { EmployeeTaskController } from './employee-task.controller';

@Module({
  controllers: [TaskController, EmployeeTaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
