import { IsString } from 'class-validator';

export class EvaluateItineraryItemDto {
  @IsString()
  itineraryItemId: string;
}
