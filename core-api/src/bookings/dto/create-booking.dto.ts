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

export class CreateBookingDto {
  @IsEnum(BookingType)
  type: BookingType;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsString()
  @MinLength(2)
  @MaxLength(220)
  providerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  confirmationCode?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsInt()
  totalCost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  notes?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}
