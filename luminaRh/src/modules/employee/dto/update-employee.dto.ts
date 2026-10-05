import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty({
    example: 'active',
    description: 'Statut de l\'employé (active, inactive, suspended)',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, description: 'Alias snake_case pour scheduleId' })
  @IsOptional()
  schedule_id?: string;
}
