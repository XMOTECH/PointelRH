import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentStatus } from '../entities/onboarding.enums';

export class ReviewDocumentDto {
  @ApiProperty({ enum: [DocumentStatus.VALIDATED, DocumentStatus.REJECTED], description: 'Décision de vérification du document' })
  @IsEnum(DocumentStatus)
  @IsNotEmpty()
  status!: DocumentStatus;

  @ApiPropertyOptional({ example: 'Photo floue, le numéro NIN n\'est pas lisible', description: 'Motif obligatoire en cas de rejet' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
