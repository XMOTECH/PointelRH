import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ example: 'Horaire de bureau (8h-17h)', description: 'Nom de l\'horaire de travail' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de l\'horaire est requis' })
  name!: string;
}
