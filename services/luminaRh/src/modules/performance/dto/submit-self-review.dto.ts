import { IsNotEmpty, IsObject, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSelfReviewDto {
  @ApiProperty({
    description: 'Réponses structurées de l\'auto-évaluation (clé = questionId, valeur = note ou texte)',
    example: { 'sec_skills_q1': 4, 'sec_goals_q1': 'Objectif atteint avec succès' },
  })
  @IsObject()
  @IsNotEmpty({ message: 'Les données d\'auto-évaluation sont requises' })
  answers!: Record<string, any>;

  @ApiProperty({
    description: 'Auto-évaluation globale (note moyenne sur 5)',
    required: false,
    example: 4.2,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  selfRating?: number;
}
