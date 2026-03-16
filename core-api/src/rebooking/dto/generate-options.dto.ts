import { IsInt, IsOptional, Min } from 'class-validator';

export class GenerateOptionsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number; // default 3
}
