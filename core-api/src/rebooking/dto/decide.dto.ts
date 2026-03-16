import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DecideRebookingDto {
  @IsString()
  optionId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rationale?: string;
}
