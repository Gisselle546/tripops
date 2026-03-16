import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProposalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;
}
