import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignEvaluationDto {
  @ApiProperty({
    description: 'Rôle du signataire (EMPLOYEE ou MANAGER)',
    example: 'EMPLOYEE',
  })
  @IsString()
  @IsNotEmpty()
  signerRole!: 'EMPLOYEE' | 'MANAGER';

  @ApiProperty({
    description: 'Commentaire final du signataire (facultatif)',
    required: false,
  })
  @IsString()
  @IsOptional()
  finalComment?: string;
}
