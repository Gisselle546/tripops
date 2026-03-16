import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DisruptionType } from '../entities/disruption-event.entity';

export class SimulateDisruptionDto {
  @IsString()
  bookingId: string;

  @IsEnum(DisruptionType)
  type: DisruptionType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
