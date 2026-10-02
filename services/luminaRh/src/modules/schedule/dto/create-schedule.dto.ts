import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ example: 'Horaire de bureau (8h-17h)', description: 'Nom de l\'horaire de travail' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de l\'horaire est requis' })
  name!: string;

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
}
