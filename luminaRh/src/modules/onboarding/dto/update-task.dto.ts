import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../entities/onboarding.enums';

export class UpdateTaskDto {
  @ApiProperty({ enum: TaskStatus, description: 'Nouveau statut de la tâche d\'onboarding' })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status!: TaskStatus;

  @ApiPropertyOptional({ example: 'Candidat absent au rendez-vous de visite médicale', description: 'Motif éventuel si rejetée ou sautée' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
