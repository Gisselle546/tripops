import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProposalOptionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(220)
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  url?: string;

  @IsOptional()
  @IsInt()
  estimatedCost?: number;
}
