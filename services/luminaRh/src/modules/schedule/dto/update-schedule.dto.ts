import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleDto {
  @ApiProperty({ example: 'Horaire de bureau (8h-17h)', description: 'Nom de l\'horaire de travail', required: false })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de l\'horaire ne peut pas être vide' })
  @IsOptional()
  name?: string;
}
