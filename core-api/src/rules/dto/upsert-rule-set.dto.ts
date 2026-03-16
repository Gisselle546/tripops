import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RuleType } from '../entities/rule.entity';

export class UpsertRuleDto {
  @IsEnum(RuleType)
  type: RuleType;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class UpsertRuleSetDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  rules: UpsertRuleDto[];
}
