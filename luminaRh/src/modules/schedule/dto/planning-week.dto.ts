import { IsNotEmpty, IsDateString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DuplicateWeekDto {
  @ApiProperty({ description: 'Date de début de la semaine source (lundi YYYY-MM-DD)', example: '2026-10-05' })
  @IsNotEmpty()
  @IsDateString()
  sourceWeekStart: string;

  @ApiProperty({ description: 'Date de début de la semaine cible (lundi YYYY-MM-DD)', example: '2026-10-12' })
  @IsNotEmpty()
  @IsDateString()
  targetWeekStart: string;

  @ApiPropertyOptional({ description: 'ID du département (optionnel, pour dupliquer uniquement une équipe)' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Écraser les shifts existants de la semaine cible si présents', default: false })
  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean;
}

export class PublishWeekDto {
  @ApiProperty({ description: 'Date de début de la semaine à publier (lundi YYYY-MM-DD)', example: '2026-10-05' })
  @IsNotEmpty()
  @IsDateString()
  weekStart: string;

  @ApiPropertyOptional({ description: 'ID du département à publier' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
