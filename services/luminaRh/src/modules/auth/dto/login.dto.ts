import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'amadou@luminarh.sn',
    description: 'L\'adresse email de l\'utilisateur connecté à Keycloak',
  })
  @IsEmail({}, { message: 'Format de l\'adresse email invalide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email!: string;

  @ApiProperty({
    example: 'password',
    description: 'Le mot de passe de l\'utilisateur',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password!: string;
}
