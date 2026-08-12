import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMyTaskDto {
  @ApiProperty({ example: 'Corriger le bug de connexion', description: 'Titre de la tâche personnelle' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title!: string;

  @ApiProperty({ example: 'Bug survenu lors de l\'authentification google', description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'high', description: 'Priorité de la tâche (low, medium, high)', default: 'medium', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ example: '2026-07-15T18:00:00Z', description: 'Date d\'échéance', required: false })
  @IsDateString()
  @IsOptional()
  due_date?: string;

  @ApiProperty({ example: 45, description: 'Temps estimé en minutes', required: false })
  @IsNumber()
  @IsOptional()
  estimated_minutes?: number;
}
