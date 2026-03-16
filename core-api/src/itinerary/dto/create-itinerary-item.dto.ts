import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
} from 'class-validator';
import {
  ItineraryItemStatus,
  ItineraryItemType,
} from '../entities/itinerary-item.entity';

export class CreateItineraryItemDto {
  @IsEnum(ItineraryItemType)
  type: ItineraryItemType;

  @IsOptional()
  @IsEnum(ItineraryItemStatus)
  status?: ItineraryItemStatus;

  @IsString()
  @MinLength(2)
  @MaxLength(220)
  title: string;

  // Optional: attach to an existing day
  @IsOptional()
  @IsString()
  dayId?: string;

  // Optional time window
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  locationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  address?: string;

  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;

  @IsOptional()
  @IsInt()
  estimatedCost?: number;
}
