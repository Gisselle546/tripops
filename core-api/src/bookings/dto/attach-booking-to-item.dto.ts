import { IsString } from 'class-validator';

export class AttachBookingToItemDto {
  @IsString()
  itineraryItemId: string;

  @IsString()
  bookingId: string;
}
