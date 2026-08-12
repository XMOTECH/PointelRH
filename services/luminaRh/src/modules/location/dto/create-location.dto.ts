import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Siège Social Dakar', description: 'Nom du site géographique de pointage' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du site est requis' })
  name!: string;

  @ApiProperty({ example: 'Route de la VDN, Dakar', description: 'Adresse physique du site', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 14.7245, description: 'Latitude géographique du site' })
  @IsNumber()
  @IsNotEmpty({ message: 'La latitude est requise' })
  latitude!: number;

  @ApiProperty({ example: -17.4578, description: 'Longitude géographique du site' })
  @IsNumber()
  @IsNotEmpty({ message: 'La longitude est requise' })
  longitude!: number;

  @ApiProperty({ example: 150.0, description: 'Rayon de géofencing autorisé (en mètres)', default: 100.0 })
  @IsNumber()
  @IsNotEmpty({ message: 'Le rayon de géofencing est requis' })
  radius_meters!: number;

  @ApiProperty({ example: true, description: 'État d\'activité du site', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
