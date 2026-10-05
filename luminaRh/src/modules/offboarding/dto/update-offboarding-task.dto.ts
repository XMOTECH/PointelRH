import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OffboardingTaskStatus } from '../entities/offboarding.enums';

export class UpdateOffboardingTaskDto {
  @ApiProperty({ enum: OffboardingTaskStatus, example: OffboardingTaskStatus.COMPLETED })
  @IsEnum(OffboardingTaskStatus)
  status!: OffboardingTaskStatus;

  @ApiProperty({ description: 'Notes explicatives ou compte-rendu', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
