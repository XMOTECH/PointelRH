import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DepartureReason, OffboardingTaskCategory, OffboardingTargetRole } from '../entities/offboarding.enums';

export class CreateOffboardingTemplateTaskDto {
  @ApiProperty({ description: 'Titre de la tâche' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Description détaillée', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: OffboardingTaskCategory, example: OffboardingTaskCategory.IT })
  @IsEnum(OffboardingTaskCategory)
  category!: OffboardingTaskCategory;

  @ApiProperty({ enum: OffboardingTargetRole, example: OffboardingTargetRole.IT })
  @IsEnum(OffboardingTargetRole)
  assignedRole!: OffboardingTargetRole;

  @ApiProperty({ description: 'Décalage en jours par rapport au dernier jour travaillé', default: 0 })
  @IsInt()
  @IsOptional()
  daysOffset?: number = 0;

  @ApiProperty({ description: 'Obligatoire pour clôturer', default: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = true;

  @ApiProperty({ description: 'Ordre d\'affichage', default: 0 })
  @IsInt()
  @IsOptional()
  order?: number = 0;
}

export class CreateOffboardingTemplateDto {
  @ApiProperty({ description: 'Nom du modèle (ex: Départ Standard CDI)' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du modèle est requis' })
  name!: string;

  @ApiProperty({ description: 'Description du modèle', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DepartureReason, required: false })
  @IsEnum(DepartureReason)
  @IsOptional()
  departureType?: DepartureReason;

  @ApiProperty({ description: 'UUID du département spécifique (ou global si vide)', required: false })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ type: [CreateOffboardingTemplateTaskDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOffboardingTemplateTaskDto)
  @IsOptional()
  tasks?: CreateOffboardingTemplateTaskDto[];
}
