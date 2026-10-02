import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, Matches, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftTemplateDto {
  @ApiProperty({ description: 'Nom du modèle', example: 'Service Matin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Heure de début (HH:mm)', example: '07:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'L\'heure de début doit être au format HH:mm' })
  startTime: string;

  @ApiProperty({ description: 'Heure de fin (HH:mm)', example: '15:30' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'L\'heure de fin doit être au format HH:mm' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Pause en minutes', default: 30, example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  breakMinutes?: number;

  @ApiPropertyOptional({ description: 'Couleur hexadécimale', default: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Poste associé' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'ID du département' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

export class UpdateShiftTemplateDto {
  @ApiPropertyOptional({ description: 'Nom du modèle' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Heure de début (HH:mm)' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime?: string;

  @ApiPropertyOptional({ description: 'Heure de fin (HH:mm)' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime?: string;

  @ApiPropertyOptional({ description: 'Pause en minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  breakMinutes?: number;

  @ApiPropertyOptional({ description: 'Couleur' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Poste' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Actif ou non' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
