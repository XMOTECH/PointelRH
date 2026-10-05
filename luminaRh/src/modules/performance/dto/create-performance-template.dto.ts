import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateCategory } from '../entities/performance.enums';

export class EvaluationQuestionDto {
  @ApiProperty({ description: 'Identifiant unique de la question dans le formulaire' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Libellé de la question ou critère d\'évaluation' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ description: 'Description ou aide à la réponse', required: false })
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiProperty({
    description: 'Type de réponse attendue (RATING_1_5, TEXT, YES_NO, MULTIPLE_CHOICE)',
    example: 'RATING_1_5',
  })
  @IsString()
  type!: 'RATING_1_5' | 'TEXT' | 'YES_NO' | 'MULTIPLE_CHOICE';

  @ApiProperty({ description: 'La question est-elle obligatoire ?', default: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = true;

  @ApiProperty({ description: 'Options possibles si MULTIPLE_CHOICE', required: false })
  @IsArray()
  @IsOptional()
  options?: string[];
}

export class EvaluationSectionDto {
  @ApiProperty({ description: 'Identifiant de la section (ex: sec_skills, sec_goals)' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Titre de la section' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Description de la section', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Pondération de la section dans la note globale', default: 1 })
  @IsOptional()
  weight?: number = 1;

  @ApiProperty({ type: [EvaluationQuestionDto], description: 'Questions de la section' })
  @IsArray()
  questions!: EvaluationQuestionDto[];
}

export class CreatePerformanceTemplateDto {
  @ApiProperty({ description: 'Titre du template (ex: Entretien Annuel Cadres & Managers)' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre du template est requis' })
  title!: string;

  @ApiProperty({ description: 'Description détaillée', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TemplateCategory, default: TemplateCategory.ANNUAL })
  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory = TemplateCategory.ANNUAL;

  @ApiProperty({
    type: [EvaluationSectionDto],
    description: 'Liste des sections composant le formulaire',
  })
  @IsArray()
  @IsNotEmpty({ message: 'Au moins une section est requise' })
  sections!: EvaluationSectionDto[];
}
