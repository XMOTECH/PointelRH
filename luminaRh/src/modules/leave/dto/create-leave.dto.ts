import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du type de congé' })
  @IsString()
  @IsNotEmpty({ message: 'Le type de congé est requis' })
  leave_type_id!: string;

  @ApiProperty({ example: '2026-08-01', description: 'Date de début (format YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty({ message: 'La date de début est requise' })
  start_date!: string;

  @ApiProperty({ example: '2026-08-10', description: 'Date de fin (format YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty({ message: 'La date de fin est requise' })
  end_date!: string;

  @ApiProperty({ example: 'Congés annuels d\'été', description: 'Raison ou motif de la demande', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: false, description: 'S\'agit-il d\'une demi-journée ?', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  half_day?: boolean;

  @ApiProperty({ example: 'morning', description: 'Période de la demi-journée (morning, afternoon)', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['morning', 'afternoon'])
  half_day_period?: string;
}
