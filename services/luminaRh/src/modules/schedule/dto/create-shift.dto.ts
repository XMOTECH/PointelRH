import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max, Matches, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftDto {
  @ApiPropertyOptional({ description: 'ID de l\'employé (optionnel si créneau ouvert non assigné)' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'ID du département' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'ID du modèle de shift utilisé' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ description: 'Date du shift (YYYY-MM-DD)', example: '2026-10-05' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Heure de début (HH:mm)', example: '08:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'L\'heure de début doit être au format HH:mm' })
  startTime: string;

  @ApiProperty({ description: 'Heure de fin (HH:mm)', example: '16:30' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'L\'heure de fin doit être au format HH:mm' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Durée de la pause en minutes', default: 0, example: 45 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  breakMinutes?: number;

  @ApiPropertyOptional({ description: 'Poste / Rôle assigné', example: 'Chauffeur' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Code couleur hexadécimal', default: '#3B82F6', example: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Notes ou instructions particulières' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Indique si le shift est ouvert/non assigné', default: false })
  @IsOptional()
  @IsBoolean()
  isUnassigned?: boolean;
}
