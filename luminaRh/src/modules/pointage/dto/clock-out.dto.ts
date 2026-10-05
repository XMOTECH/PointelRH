import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClockOutDto {
  @ApiProperty({
    example: 'uuid-employee',
    description: 'UUID de l\'employé pour le pointage de sortie sur kiosque public',
    required: false,
  })
  @IsString()
  @IsOptional()
  employee_id?: string;

  @ApiProperty({
    example: 'uuid-employee',
    description: 'UUID de l\'employé (variante camelCase)',
    required: false,
  })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({
    example: 'uuid-company',
    description: 'UUID de l\'entreprise',
    required: false,
  })
  @IsString()
  @IsOptional()
  company_id?: string;

  @ApiProperty({
    example: 14.6937,
    description: 'La latitude de géolocalisation actuelle de l\'employé',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: -17.4441,
    description: 'La longitude de géolocalisation actuelle de l\'employé',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

