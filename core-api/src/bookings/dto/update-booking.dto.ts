import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
} from 'class-validator';
import { BookingStatus, BookingType } from '../entities/booking.entity';

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(220)
  providerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  confirmationCode?: string | null;

  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @IsOptional()
  @IsInt()
  totalCost?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  notes?: string | null;

  @IsOptional()
  @IsObject()
  details?: Record<string, any> | null;
}
