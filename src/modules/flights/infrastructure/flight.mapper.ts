import { Flight } from '../domain/entities/flight.entity';

type PrismaFlightData = {
  id: string;
  flightNumber: string;
  airlineId: string;
  originIata: string;
  destinationIata: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  frequency: number[];
};

export class FlightMapper {
  static toDomain(prismaFlight: PrismaFlightData): Flight {
    return Flight.create({
      id: prismaFlight.id,
      flightNumber: prismaFlight.flightNumber,
      airlineId: prismaFlight.airlineId,
      originIata: prismaFlight.originIata,
      destinationIata: prismaFlight.destinationIata,
      departureDatetime: prismaFlight.departureDatetime,
      arrivalDatetime: prismaFlight.arrivalDatetime,
      frequency: prismaFlight.frequency,
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
    };
  }
}
