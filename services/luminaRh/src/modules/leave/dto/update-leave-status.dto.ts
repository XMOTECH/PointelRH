import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLeaveStatusDto {
  @ApiProperty({ example: 'approved', description: 'Nouveau statut de la demande (approved, rejected, escalated)' })
  @IsString()
  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsIn(['pending', 'approved', 'rejected', 'escalated'])
  status!: string;

  @ApiProperty({ example: 'Solde insuffisant pour ce type de congé', description: 'Raison en cas de rejet', required: false })
  @IsString()
  @IsOptional()
  rejection_reason?: string;
}
