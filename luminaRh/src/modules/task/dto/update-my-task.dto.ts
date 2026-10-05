import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateMyTaskDto } from './create-my-task.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateMyTaskDto extends PartialType(CreateMyTaskDto) {
  @ApiProperty({ example: 'in_progress', description: 'Statut de la tâche (todo, in_progress, done)', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: string;
}
