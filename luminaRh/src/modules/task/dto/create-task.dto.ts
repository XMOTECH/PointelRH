import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Rédiger le rapport mensuel', description: 'Titre de la tâche' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title!: string;

  @ApiProperty({ example: 'Détails des ventes et KPIs', description: 'Description facultative', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'medium', description: 'Priorité de la tâche (low, medium, high)', default: 'medium', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID de l\'employé assigné' })
  @IsString()
  @IsNotEmpty({ message: 'L\'assignataire de la tâche est requis' })
  assigned_to!: string;

  @ApiProperty({ example: 'f871751e-7b03-4432-be2a-02ed5c62ccc3', description: 'UUID de la mission associée', required: false })
  @IsString()
  @IsOptional()
  mission_id?: string;

  @ApiProperty({ example: '2026-07-30T12:00:00Z', description: 'Date d\'échéance', required: false })
  @IsDateString()
  @IsOptional()
  due_date?: string;

  @ApiProperty({ example: 'weekly', description: 'Récurrence de la tâche (daily, weekly)', required: false })
  @IsString()
  @IsOptional()
  recurrence?: string;

  @ApiProperty({ example: 60, description: 'Temps estimé en minutes', required: false })
  @IsNumber()
  @IsOptional()
  estimated_minutes?: number;
}
