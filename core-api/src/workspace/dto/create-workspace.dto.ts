import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
