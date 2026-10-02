import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DepartureReason, NoticePeriodType } from '../entities/offboarding.enums';

export class CreateOffboardingSessionDto {
  @ApiProperty({ description: "UUID de l'employé concerné par le départ" })
  @IsString()
  @IsNotEmpty({ message: "L'employé est requis" })
  employeeId!: string;

  @ApiProperty({
    description: 'Motif du départ',
    enum: DepartureReason,
    example: DepartureReason.RESIGNATION,
  })
  @IsEnum(DepartureReason, { message: 'Motif de départ invalide' })
  @IsNotEmpty({ message: 'Le motif de départ est requis' })
  departureReason!: DepartureReason;

  @ApiProperty({
    description: 'Type de préavis',
    enum: NoticePeriodType,
    example: NoticePeriodType.WORKED,
    required: false,
  })
  @IsEnum(NoticePeriodType)
  @IsOptional()
  noticePeriodType?: NoticePeriodType = NoticePeriodType.WORKED;

  @ApiProperty({ description: 'Date de notification / remise de la lettre', required: false })
  @IsDateString()
  @IsOptional()
  notificationDate?: string;

  @ApiProperty({ description: 'Dernier jour effectif de présence' })
  @IsDateString()
  @IsNotEmpty({ message: 'Le dernier jour de travail est requis' })
  lastWorkingDate!: string;

  @ApiProperty({ description: 'Date de fin officielle du contrat' })
  @IsDateString()
  @IsNotEmpty({ message: 'La date de fin de contrat est requise' })
  contractEndDate!: string;

  @ApiProperty({ description: 'UUID du modèle de checklist à appliquer', required: false })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiProperty({ description: 'Notes de passation initiales', required: false })
  @IsString()
  @IsOptional()
  handoverNotes?: string;
}
