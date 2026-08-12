import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClockInDto {
  @ApiProperty({
    example: 'pin',
    description: 'Le canal de pointage utilisé (pin, qr, face)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le canal de pointage est requis (pin, qr, face)' })
  channel!: string;

  @ApiProperty({
    example: { pin: '1234' },
    description: 'Le payload contenant les données d\'identification nécessaires (ex: { pin: "1234" } ou { token: "uuid-du-qr" })',
  })
  @IsNotEmpty({ message: 'Le contenu du pointage (payload) est requis' })
  payload!: any; // { pin: '...' } ou { token: '...' }

  @ApiProperty({
    example: 14.6937,
    description: 'La latitude de géolocalisation actuelle du terminal de pointage',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: -17.4441,
    description: 'La longitude de géolocalisation actuelle du terminal de pointage',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

