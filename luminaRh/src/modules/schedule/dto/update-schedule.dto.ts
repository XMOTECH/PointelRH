import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleDto {
  @ApiProperty({ example: 'Horaire de bureau (8h-17h)', description: 'Nom de l\'horaire de travail', required: false })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de l\'horaire ne peut pas être vide' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '08:00', description: 'Heure de début', required: false })
  @IsString()
  @IsOptional()
  start_time?: string;

  @ApiProperty({ example: '17:00', description: 'Heure de fin', required: false })
  @IsString()
  @IsOptional()
  end_time?: string;

  @ApiProperty({ example: 15, description: 'Tolérance de retard en minutes', required: false })
  @IsNumber()
  @IsOptional()
  grace_minutes?: number;

  @ApiProperty({ example: [1, 2, 3, 4, 5], description: 'Jours travaillés (1=Lun, 7=Dim)', required: false })
  @IsArray()
  @IsOptional()
  work_days?: number[];
}

