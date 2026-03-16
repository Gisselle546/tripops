import { PartialType } from '@nestjs/mapped-types';
import { UpsertRuleDto } from './upsert-rule-set.dto';

export class UpdateRuleDto extends PartialType(UpsertRuleDto) {}
