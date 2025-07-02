import { randomUUID } from 'crypto';
import { Flight } from '../../src/modules/flights/domain/entities/flight.entity';
import { FlightProps } from '../../src/modules/flights/domain/entities/flight.entity';
import {
  FlightId,
  FlightNumber,
  Frequency,
  IataCode,
} from '../../src/modules/flights/domain/value-objects';

export class TestFlightFactory {
  static create(overrideProps: Partial<FlightProps> = {}): Flight {
    const defaultProps: FlightProps = {
      id: overrideProps.id ?? new FlightId(overrideProps.id ?? randomUUID()),
      flightNumber: new FlightNumber('LA3456'),
      airlineId: 'b7a7c9a8-a8f6-4f7b-9b4d-3b1a1b1a1b1a',
      originIata: new IataCode('BSB'),
      destinationIata: new IataCode('GIG'),
      departureDatetime: new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime: new Date('2025-07-01T12:05:00Z'),
      frequency: new Frequency([1, 3, 5]),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    return Flight.create({ ...defaultProps, ...overrideProps });
  }
}
