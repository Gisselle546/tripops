import { IsInt, IsOptional, Min } from 'class-validator';

export class ListAuditLogsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
