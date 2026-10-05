import { IsNotEmpty, IsObject, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitManagerReviewDto {
  @ApiProperty({
    description: 'Évaluations et commentaires du manager par question',
    example: { 'sec_skills_q1': 4, 'sec_goals_q1': 'Très bon travail' },
  })
  @IsObject()
  @IsNotEmpty({ message: 'Les données d\'évaluation managériale sont requises' })
  answers!: Record<string, any>;

  @ApiProperty({
    description: 'Note globale attribuée par le manager (sur 5)',
    example: 4.5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty({ message: 'La note managériale globale est requise' })
  managerRating!: number;

  @ApiProperty({
    description: 'Synthèse des échanges et décisions communes lors de l\'entretien en présentiel',
    required: false,
  })
  @IsString()
  @IsOptional()
  sharedNotes?: string;
}
