import { IsDateString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateItineraryDayDto {
  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsOptional()
  @IsInt()
  @Min(0)
  dayIndex?: number;
}
