import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PunchDto {
  @ApiProperty({
    example: 'pin',
    description: 'Le canal de pointage utilisé (pin, qr, face, web)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le canal de pointage est requis (pin, qr, face, web)' })
  channel!: string;

  @ApiProperty({
    example: { pin: '1234' },
    description: 'Données d\'identification (ex: { pin: "1234" }, { descriptor: [...] }, { userId: "..." })',
  })
  @IsNotEmpty({ message: 'Le contenu du pointage (payload) est requis' })
  payload!: any;

  @ApiProperty({
    example: 'auto',
    description: 'Action souhaitée: auto (smart toggle), in (entrée explicite), out (sortie explicite)',
    required: false,
    enum: ['auto', 'in', 'out'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['auto', 'in', 'out'])
  action?: 'auto' | 'in' | 'out' = 'auto';

  @ApiProperty({
    example: 'uuid-company',
    description: 'UUID de l\'entreprise (optionnel si résolu via l\'employé ou le token)',
    required: false,
  })
  @IsString()
  @IsOptional()
  company_id?: string;

  @ApiProperty({
    example: 'uuid-company',
    description: 'UUID de l\'entreprise (camelCase)',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({
    example: 14.6937,
    description: 'Latitude GPS actuelle du terminal de pointage',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: -17.4441,
    description: 'Longitude GPS actuelle du terminal de pointage',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
