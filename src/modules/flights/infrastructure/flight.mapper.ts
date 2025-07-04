import type { Flight as PrismaFlight } from '@prisma/client';
import { Flight } from '../domain/entities/flight.entity';
import {
  FlightId,
  FlightNumber,
  IataCode,
  Frequency,
} from '../domain/value-objects';

export class FlightMapper {
  static toDomain(prismaFlight: PrismaFlight): Flight {
    return Flight.create({
      id: FlightId.create(prismaFlight.id),
      flightNumber: new FlightNumber(prismaFlight.flightNumber),
      airlineId: prismaFlight.airlineId,
      originIata: new IataCode(prismaFlight.originIata),
      destinationIata: new IataCode(prismaFlight.destinationIata),
      departureDatetime: prismaFlight.departureDatetime,
      arrivalDatetime: prismaFlight.arrivalDatetime,
      frequency: new Frequency(prismaFlight.frequency),
      createdAt: prismaFlight.createdAt,
      updatedAt: prismaFlight.updatedAt,
      deletedAt: prismaFlight.deletedAt,
    });
  }

  static toPersistence(flight: Flight): PrismaFlight {
    return {
      id: flight.id.getValue(),
      flightNumber: flight.flightNumber.getValue(),
      airlineId: flight.airlineId,
      originIata: flight.originIata.getValue(),
      destinationIata: flight.destinationIata.getValue(),
      departureDatetime: flight.departureDatetime,
      arrivalDatetime: flight.arrivalDatetime,
      frequency: flight.frequency.getValue(),
      createdAt: flight.createdAt,
      updatedAt: flight.updatedAt,
      deletedAt: flight.deletedAt,
    };
  }
}
