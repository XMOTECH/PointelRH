import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'f871751e-7b03-4432-be2a-02ed5c62ccc3', description: 'UUID du template d\'onboarding à instancier' })
  @IsUUID('4')
  @IsNotEmpty()
  templateId!: string;

  @ApiProperty({ example: 'Amadou', description: 'Prénom du futur collaborateur' })
  @IsString()
  @IsNotEmpty()
  candidateFirstName!: string;

  @ApiProperty({ example: 'Diallo', description: 'Nom de famille du futur collaborateur' })
  @IsString()
  @IsNotEmpty()
  candidateLastName!: string;

  @ApiProperty({ example: 'amadou.diallo@candidat.sn', description: 'Email personnel du candidat pour recevoir l\'invitation' })
  @IsEmail()
  @IsNotEmpty()
  candidateEmail!: string;

  @ApiProperty({ example: '+221773169188', description: 'Numéro de téléphone mobile pour notification SMS/WhatsApp' })
  @IsString()
  @IsNotEmpty()
  candidatePhone!: string;

  @ApiProperty({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'Département d\'affectation' })
  @IsUUID('4')
  @IsNotEmpty()
  departmentId!: string;

  @ApiPropertyOptional({ example: 'f871751e-7b03-4432-be2a-02ed5c62ccc3', description: 'Planning horaire / rotation (ex: 3x8)' })
  @IsUUID('4')
  @IsOptional()
  scheduleId?: string;

  @ApiProperty({ example: 'cdi', description: 'Type de contrat (cdi, cdd, stage, interim)' })
  @IsString()
  @IsNotEmpty()
  contractType!: string;

  @ApiProperty({ example: '2026-10-15', description: 'Date de démarrage prévue (Jour J)' })
  @IsString()
  @IsNotEmpty()
  targetStartDate!: string;

  @ApiPropertyOptional({ example: 3, description: 'Durée de la période d\'essai en mois' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  probationDurationMonths?: number;

  @ApiPropertyOptional({ example: 350000, description: 'Salaire brut de base mensuel en FCFA' })
  @IsNumber()
  @IsOptional()
  baseSalary?: number;

  @ApiPropertyOptional({ example: 20800, description: 'Indemnité de transport légale en FCFA' })
  @IsNumber()
  @IsOptional()
  transportAllowance?: number;

  @ApiPropertyOptional({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du Manager responsable' })
  @IsUUID('4')
  @IsOptional()
  managerId?: string;
}
