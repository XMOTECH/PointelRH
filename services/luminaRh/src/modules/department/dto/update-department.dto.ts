import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Ressources Humaines', description: 'Nom du département', required: false })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du département ne peut pas être vide' })
  @IsOptional()
  name?: string;
}
