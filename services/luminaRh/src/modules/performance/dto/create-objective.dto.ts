import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectiveCategory, ObjectiveStatus } from '../entities/performance.enums';

export class CreateObjectiveDto {
  @ApiProperty({ description: 'UUID du collaborateur concerné' })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ description: 'Titre de l\'objectif (ex: Augmenter le taux de rétention client de 15%)' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Description et critères d\'évaluation', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ObjectiveCategory, default: ObjectiveCategory.INDIVIDUAL })
  @IsEnum(ObjectiveCategory)
  @IsOptional()
  category?: ObjectiveCategory = ObjectiveCategory.INDIVIDUAL;

  @ApiProperty({ description: 'Pondération (poids relatif de l\'objectif)', default: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  weight?: number = 1;

  @ApiProperty({ description: 'Valeur cible numérique', required: false, example: 100 })
  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @ApiProperty({ description: 'Unité de mesure (ex: %, EUR, points)', required: false, example: '%' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Échéance prévue (date)', required: false, example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateObjectiveDto {
  @ApiProperty({ description: 'Titre de l\'objectif', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Valeur actuelle mesurée', required: false, example: 75 })
  @IsNumber()
  @IsOptional()
  currentValue?: number;

  @ApiProperty({ description: 'Pourcentage de progression global (0 à 100)', example: 75, required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiProperty({ enum: ObjectiveStatus, required: false })
  @IsEnum(ObjectiveStatus)
  @IsOptional()
  status?: ObjectiveStatus;
}
