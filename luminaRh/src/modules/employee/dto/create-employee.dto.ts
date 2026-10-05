import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Amadou', description: 'Prénom de l\'employé' })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName!: string;

  @ApiProperty({ example: 'Diallo', description: 'Nom de famille de l\'employé' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de famille est requis' })
  lastName!: string;

  @ApiProperty({ example: 'amadou@luminarh.sn', description: 'Adresse email de l\'employé' })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email!: string;

  @ApiProperty({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du département de l\'employé' })
  @IsUUID('4', { message: 'Format du département invalide' })
  @IsNotEmpty({ message: 'Le département est requis' })
  departmentId!: string;

  @ApiProperty({ example: 'f871751e-7b03-4432-be2a-02ed5c62ccc3', description: 'UUID du planning assigné', required: false })
  @IsUUID('4', { message: 'Format du planning invalide' })
  @IsOptional()
  scheduleId?: string;

  @ApiProperty({ example: 'cdi', description: 'Type de contrat (cdi, cdd, stage, interim)', default: 'cdi', required: false })
  @IsString()
  @IsOptional()
  contractType?: string;

  @ApiProperty({ example: '2026-06-11', description: 'Date de recrutement (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  hireDate?: string;

  @ApiProperty({ example: '1234', description: 'Code PIN à 4 chiffres pour pointer sur Kiosque', required: false })
  @IsString()
  @IsOptional()
  pinCode?: string;

  @ApiProperty({ example: 'employee', description: 'Rôle d\'accès (employee, admin, manager)', default: 'employee', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}
