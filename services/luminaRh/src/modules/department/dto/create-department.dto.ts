import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Ressources Humaines', description: 'Nom du département' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du département est requis' })
  name!: string;
}
