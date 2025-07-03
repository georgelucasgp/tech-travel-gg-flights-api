import {
  Booking as PrismaBooking,
  Itinerary as PrismaItinerary,
  ItineraryFlight as PrismaItineraryFlight,
  Flight as PrismaFlight,
} from '../../../../generated/prisma/client';
import { Booking } from '../domain/entities/booking.entity';
import { BookingFactory } from '../application/booking.factory';
import { ItineraryMapper } from '../../itineraries/infrastructure/itinerary.mapper';

type PrismaBookingWithItinerary = PrismaBooking & {
  itinerary: PrismaItinerary & {
    flights: (PrismaItineraryFlight & {
      flight: PrismaFlight;
    })[];
  };
};

export class BookingMapper {
  static toDomain(prismaBooking: PrismaBookingWithItinerary): Booking {
    const itinerary = ItineraryMapper.toDomain(prismaBooking.itinerary);

    return BookingFactory.create({
      id: prismaBooking.id,
      code: prismaBooking.code,
      user_id: prismaBooking.userId,
      itinerary,
      status: prismaBooking.status,
      createdAt: prismaBooking.createdAt,
      updatedAt: prismaBooking.updatedAt,
    });
  }

  static toPersistence(booking: Booking) {
    return {
      id: booking.id.getValue(),
      code: booking.code.getValue(),
      userId: booking.userId,
      itineraryId: booking.itinerary.id.getValue(),
      status: booking.status.getValue(),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
