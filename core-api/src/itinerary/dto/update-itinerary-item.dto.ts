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

export class UpdateItineraryItemDto {
  @IsOptional()
  @IsEnum(ItineraryItemType)
  type?: ItineraryItemType;

  @IsOptional()
  @IsEnum(ItineraryItemStatus)
  status?: ItineraryItemStatus;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(220)
  title?: string;

  @IsOptional()
  @IsString()
  dayId?: string | null;

  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  locationName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  address?: string | null;

  @IsOptional()
  lat?: number | null;

  @IsOptional()
  lng?: number | null;

  @IsOptional()
  @IsInt()
  estimatedCost?: number | null;
}
