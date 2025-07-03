import { Flight } from '../domain/entities/flight.entity';
import {
  FlightNumber,
  IataCode,
  Frequency,
  FlightId,
} from '../domain/value-objects';
import { randomUUID } from 'crypto';

export type FlightFactoryProps = {
  id?: string;
  flightNumber: string;
  airlineId: string;
  originIata: string;
  destinationIata: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  frequency: number[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export class FlightFactory {
  static create(props: FlightFactoryProps): Flight {
    return Flight.create({
      id: new FlightId(props.id ?? randomUUID()),
      flightNumber: new FlightNumber(props.flightNumber),
      airlineId: props.airlineId,
      originIata: new IataCode(props.originIata),
      destinationIata: new IataCode(props.destinationIata),
      departureDatetime: props.departureDatetime,
      arrivalDatetime: props.arrivalDatetime,
      frequency: new Frequency(props.frequency),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
  }
}
