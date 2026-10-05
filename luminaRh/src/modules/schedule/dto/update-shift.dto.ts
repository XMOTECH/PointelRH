import { PartialType } from '@nestjs/swagger';
import { CreateShiftDto } from './create-shift.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @ApiPropertyOptional({ description: 'Statut du shift', enum: ['DRAFT', 'PUBLISHED', 'CONFIRMED', 'CANCELLED'] })
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'CONFIRMED', 'CANCELLED'])
  status?: string;
}

export class MoveShiftDto {
  @ApiPropertyOptional({ description: 'Nouvel ID employé (ou null pour désassigner)' })
  @IsOptional()
  employeeId?: string | null;

  @ApiPropertyOptional({ description: 'Nouvelle date (YYYY-MM-DD)' })
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Nouvelle heure de début (HH:mm)' })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Nouvelle heure de fin (HH:mm)' })
  @IsOptional()
  endTime?: string;
}
