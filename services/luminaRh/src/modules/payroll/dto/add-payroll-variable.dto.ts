import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddPayrollVariableDto {
  @ApiProperty({ description: 'Libellé de la prime ou de la retenue', example: 'Prime de rendement' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Montant en FCFA', example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Indique si la prime est imposable à l\'IR', default: true })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean = true;

  @ApiProperty({ description: 'Indique si la prime est soumise aux cotisations IPRES/CSS', default: true })
  @IsOptional()
  @IsBoolean()
  isSubjectToSocial?: boolean = true;
}
