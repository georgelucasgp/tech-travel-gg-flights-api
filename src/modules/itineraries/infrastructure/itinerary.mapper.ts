import { Itinerary } from '../domain/entities/itinerary.entity';
import { ItineraryId } from '../domain/value-objects';
import { FlightMapper } from '../../flights/infrastructure/flight.mapper';
import {
  Itinerary as PrismaItinerary,
  ItineraryFlight as PrismaItineraryFlight,
  Flight as PrismaFlight,
} from 'generated/prisma/client';

type PrismaItineraryWithFlights = PrismaItinerary & {
  flights: (PrismaItineraryFlight & {
    flight: PrismaFlight;
  })[];
};

export class ItineraryMapper {
  static toDomain(prismaItinerary: PrismaItineraryWithFlights): Itinerary {
    const domainFlights = prismaItinerary.flights.map((itineraryFlight) =>
      FlightMapper.toDomain(itineraryFlight.flight),
    );

    return Itinerary.create({
      id: ItineraryId.create(prismaItinerary.id),
      flights: domainFlights,
      createdAt: prismaItinerary.createdAt,
      updatedAt: prismaItinerary.updatedAt,
      deletedAt: prismaItinerary.deletedAt,
    });
  }

  static toPersistence(itinerary: Itinerary) {
    return {
      id: itinerary.id.getValue(),
      createdAt: itinerary.createdAt,
      updatedAt: itinerary.updatedAt,
      deletedAt: itinerary.deletedAt,
      flights: {
        create: itinerary.flights.map((flight, index) => ({
          flight: {
            connect: { id: flight.id.getValue() },
          },
          order: index + 1,
        })),
      },
    };
  }
}
