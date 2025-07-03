import { Flight } from '../domain/entities/flight.entity';
import {
  FlightNumber,
  IataCode,
  Frequency,
  FlightId,
} from '../domain/value-objects';

export type FlightFactoryProps = {
  id?: string;
  flight_number: string;
  airline_id: string;
  origin_iata: string;
  destination_iata: string;
  departure_datetime: Date;
  arrival_datetime: Date;
  frequency: number[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export class FlightFactory {
  static create(props: FlightFactoryProps): Flight {
    return Flight.create({
      id: props.id ? new FlightId(props.id) : FlightId.create(),
      flightNumber: new FlightNumber(props.flight_number),
      airlineId: props.airline_id,
      originIata: new IataCode(props.origin_iata),
      destinationIata: new IataCode(props.destination_iata),
      departureDatetime: props.departure_datetime,
      arrivalDatetime: props.arrival_datetime,
      frequency: new Frequency(props.frequency),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
  }
}
