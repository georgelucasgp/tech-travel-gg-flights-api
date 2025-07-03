import { Booking } from '../../domain/entities/booking.entity';
import { ItineraryResponseDto } from '../../../itineraries/presentation/dto/itinerary-response.dto';
import { BookingStatus } from '../../domain/value-objects/booking-status.value-object';

export class BookingResponseDto {
  id: string;
  code: string;
  user_id: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  itinerary: ItineraryResponseDto;

  static fromEntity(booking: Booking): BookingResponseDto {
    return {
      id: booking.id.toString(),
      code: booking.code.toString(),
      user_id: booking.userId,
      status: booking.status,
      created_at: booking.createdAt.toISOString(),
      updated_at: booking.updatedAt.toISOString(),
      itinerary: ItineraryResponseDto.fromEntity(booking.itinerary),
    };
  }
}
