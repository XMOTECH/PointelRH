import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePerformanceCampaignDto {
  @ApiProperty({ description: 'Titre de la campagne (ex: Campagne d\'évaluation Annuelle 2026)' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre de la campagne est requis' })
  title!: string;

  @ApiProperty({ description: 'Description et consignes pour les managers et collaborateurs', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'UUID du modèle de formulaire (PerformanceTemplate) à utiliser' })
  @IsString()
  @IsNotEmpty({ message: 'Le modèle d\'évaluation est obligatoire' })
  templateId!: string;

  @ApiProperty({ description: 'Année de référence (ex: 2026)', example: 2026 })
  @IsInt()
  @IsNotEmpty()
  year!: number;

  @ApiProperty({ description: 'Date de début de la campagne (ISO 8601)', example: '2026-10-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ description: 'Date limite de réalisation (ISO 8601)', example: '2026-12-15T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({
    description: 'Liste optionnelle des IDs de départements ciblés (si omis, toute l\'entreprise)',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  departmentIds?: string[];

  @ApiProperty({
    description: 'Liste optionnelle des IDs d\'employés ciblés (sélection manuelle)',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  employeeIds?: string[];
}
