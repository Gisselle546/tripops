import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password: string;
}
