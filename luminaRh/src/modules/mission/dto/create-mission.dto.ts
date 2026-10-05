import { IsNotEmpty, IsString, IsOptional, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMissionDto {
  @ApiProperty({ example: 'Déploiement client Dakar', description: 'Titre de la mission' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title!: string;

  @ApiProperty({ example: 'Installation serveur et réseau chez le client', description: 'Description de la mission', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'VDN, Dakar', description: 'Lieu géographique de la mission', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'active', description: 'Statut de la mission (draft, active, completed, cancelled)', default: 'draft', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '2026-07-05T08:00:00Z', description: 'Date de début de la mission' })
  @IsDateString()
  @IsNotEmpty({ message: 'La date de début est requise' })
  start_date!: string;

  @ApiProperty({ example: '2026-07-15T18:00:00Z', description: 'Date de fin de la mission', required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du département', required: false })
  @IsString()
  @IsOptional()
  department_id?: string;

  @ApiProperty({ example: ['uuid-employe-1', 'uuid-employe-2'], description: 'UUIDs des employés affectés à la mission', required: false })
  @IsArray()
  @IsOptional()
  employee_ids?: string[];
}
