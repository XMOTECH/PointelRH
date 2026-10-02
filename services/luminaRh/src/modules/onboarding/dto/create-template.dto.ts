import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskCategory, TargetRole } from '../entities/onboarding.enums';

export class CreateTemplateTaskDto {
  @ApiProperty({ example: 'Visite médicale d\'aptitude', description: 'Intitulé de la tâche' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Visite médicale d\'embauche auprès de la médecine du travail de l\'usine' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskCategory, default: TaskCategory.ADMINISTRATIVE })
  @IsEnum(TaskCategory)
  category!: TaskCategory;

  @ApiProperty({ enum: TargetRole, default: TargetRole.CANDIDATE })
  @IsEnum(TargetRole)
  targetRole!: TargetRole;

  @ApiProperty({ example: -7, description: 'Décalage en jours par rapport au Jour J (-7 = J-7, 0 = J0, 30 = J+30)' })
  @IsInt()
  daysOffset!: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  isRequired!: boolean;

  @ApiProperty({ default: 0 })
  @IsInt()
  order!: number;

  @ApiPropertyOptional({ description: 'Index ou UUID de la tâche préalable (DAG)', required: false })
  @IsOptional()
  prerequisiteId?: string;
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Ouvrier Usine 3x8 - SOCOCIM', description: 'Nom du modèle d\'onboarding' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Modèle dédié aux postes de production et de maintenance en environnement industriel' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'cdi', description: 'Type de contrat associé (cdi, cdd, stage, interim)' })
  @IsString()
  @IsOptional()
  contractType?: string;

  @ApiPropertyOptional({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'Département par défaut' })
  @IsUUID('4')
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ type: [CreateTemplateTaskDto], description: 'Liste des tâches modèles associées' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateTaskDto)
  tasks!: CreateTemplateTaskDto[];
}
