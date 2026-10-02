import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitCandidateDataDto {
  @ApiProperty({ example: '1995-04-12', description: 'Date de naissance (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  birthDate!: string;

  @ApiProperty({ example: 'Thiès', description: 'Lieu de naissance' })
  @IsString()
  @IsNotEmpty()
  birthPlace!: string;

  @ApiProperty({ example: 'Sénégalaise', description: 'Nationalité' })
  @IsString()
  @IsNotEmpty()
  nationality!: string;

  @ApiProperty({ example: 'male', description: 'Genre (male, female)' })
  @IsString()
  @IsNotEmpty()
  gender!: string;

  @ApiProperty({ example: '1 755 1995 01234', description: 'Numéro d\'Identification Nationale (NIN / CNI CEDEAO)' })
  @IsString()
  @IsNotEmpty()
  nationalIdNumber!: string;

  @ApiProperty({ example: 'Quartier Cité Lamy, Rufisque, Dakar', description: 'Adresse de résidence' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'married', description: 'Situation matrimoniale (single, married, widowed, divorced)' })
  @IsString()
  @IsNotEmpty()
  maritalStatus!: string;

  @ApiProperty({ example: 2, description: 'Nombre d\'enfants à charge légalement déclarés' })
  @IsInt({ message: 'Le nombre d\'enfants doit être un entier' })
  @Min(0, { message: 'Le nombre d\'enfants ne peut pas être négatif' })
  @Max(30, { message: 'Le nombre d\'enfants ne peut pas dépasser 30' })
  childrenCount!: number;

  @ApiPropertyOptional({ example: 'CBAO Groupe Attijariwafa Bank', description: 'Nom de l\'établissement bancaire' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: 'SN012 01001 012345678901 45', description: 'Relevé d\'Identité Bancaire (RIB/IBAN)' })
  @IsString()
  @IsOptional()
  bankRib?: string;

  @ApiPropertyOptional({ example: 'wave', description: 'Opérateur Mobile Money (wave, orange_money, free_money)' })
  @IsString()
  @IsOptional()
  mobileMoneyProvider?: string;

  @ApiPropertyOptional({ example: '+221773169188', description: 'Numéro de compte Mobile Money' })
  @IsString()
  @IsOptional()
  mobileMoneyNumber?: string;

  @ApiPropertyOptional({ example: '12345678', description: 'Numéro d\'immatriculation IPRES si déjà existant' })
  @IsString()
  @IsOptional()
  ipresNumber?: string;

  @ApiPropertyOptional({ example: '87654321', description: 'Numéro d\'immatriculation Caisse de Sécurité Sociale (CSS)' })
  @IsString()
  @IsOptional()
  cssNumber?: string;

  // Contact d'urgence (indispensable en usine / chantier)
  @ApiProperty({ example: 'Fatou Ndiaye', description: 'Nom et prénom de la personne à contacter en cas d\'urgence' })
  @IsString()
  @IsNotEmpty()
  emergencyContactName!: string;

  @ApiProperty({ example: '+221771234567', description: 'Téléphone de la personne à contacter en cas d\'urgence' })
  @IsString()
  @IsNotEmpty()
  emergencyContactPhone!: string;

  @ApiProperty({ example: 'Épouse', description: 'Lien de parenté avec le contact d\'urgence' })
  @IsString()
  @IsNotEmpty()
  emergencyContactRelation!: string;

  // Données Équipements de Protection Individuelle (EPI)
  @ApiPropertyOptional({ example: '43', description: 'Pointure de chaussures de sécurité' })
  @IsString()
  @IsOptional()
  shoeSize?: string;

  @ApiPropertyOptional({ example: 'L', description: 'Taille de combinaison / vêtements de travail' })
  @IsString()
  @IsOptional()
  clothingSize?: string;
}
