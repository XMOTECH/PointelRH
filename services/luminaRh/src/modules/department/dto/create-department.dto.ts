import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Ressources Humaines', description: 'Nom du département' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du département est requis' })
  name!: string;

  @ApiProperty({ example: 'uuid-employee', description: 'ID de l\'employé manager', required: false })
  @IsString()
  @IsOptional()
  manager_id?: string;
}
