import { Flight } from '../domain/entities/flight.entity';
import { FlightFactory } from '../application/flight.factory';

type PrismaFlightData = {
  id: string;
  flightNumber: string;
  airlineId: string;
  originIata: string;
  destinationIata: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  frequency: number[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class FlightMapper {
  static toDomain(prismaFlight: PrismaFlightData): Flight {
    return FlightFactory.create({
      id: prismaFlight.id,
      flightNumber: prismaFlight.flightNumber,
      airlineId: prismaFlight.airlineId,
      originIata: prismaFlight.originIata,
      destinationIata: prismaFlight.destinationIata,
      departureDatetime: prismaFlight.departureDatetime,
      arrivalDatetime: prismaFlight.arrivalDatetime,
      frequency: prismaFlight.frequency,
      createdAt: prismaFlight.createdAt,
      updatedAt: prismaFlight.updatedAt,
      deletedAt: prismaFlight.deletedAt,
    });
  }

  static toPersistence(flight: Flight): PrismaFlightData {
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
