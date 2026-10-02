import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveExitInterviewDto {
  @ApiProperty({ description: 'Compte-rendu de l\'entretien de départ RH / Manager' })
  @IsString()
  @IsNotEmpty({ message: 'Les notes d\'entretien sont requises' })
  exitInterviewNotes!: string;

  @ApiProperty({ description: 'Retours, suggestions et feedbacks du collaborateur', required: false })
  @IsString()
  @IsOptional()
  reasonsFeedback?: string;
}
