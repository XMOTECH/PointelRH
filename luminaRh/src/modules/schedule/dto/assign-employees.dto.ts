import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignEmployeesDto {
  @ApiProperty({ type: [String], description: 'Liste des identifiants des employés à associer', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  employeeIds?: string[];

  @ApiProperty({ type: [String], description: 'Alias snake_case', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  employee_ids?: string[];
}
