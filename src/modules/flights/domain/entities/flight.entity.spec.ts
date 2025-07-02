import { FlightFactory, FlightProps } from '../../application/flight.factory';
import { CreateFlightDto } from '../../presentation/dto/create-flight.dto';
import { Flight } from './flight.entity';
import { FlightNumber, IataCode, Frequency } from '../value-objects';

describe('Flight Entity', () => {
  let flight: Flight;
  let flightData: FlightProps;

  beforeEach(() => {
    flightData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      flightNumber: 'LA3456',
      airlineId: 'airline-123',
      originIata: 'BSB',
      destinationIata: 'GIG',
      departureDatetime: new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime: new Date('2025-07-01T12:05:00Z'),
      frequency: [1, 3, 5],
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
      deletedAt: null,
    };

    flight = FlightFactory.create(flightData);
  });

  it('should create a flight with all required properties', () => {
    const createFlightData: CreateFlightDto = {
      flightNumber: 'LA3456',
      airlineId: 'airline-123',
      originIata: 'BSB',
      destinationIata: 'GIG',
      departureDatetime: new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime: new Date('2025-07-01T12:05:00Z'),
      frequency: [1, 3, 5],
    };

    const newFlight = FlightFactory.create(createFlightData);

    expect(newFlight).toBeInstanceOf(Flight);
  });

  it('should create flight with provided id', () => {
    const newFlight = FlightFactory.create(flightData);

    expect(newFlight.id.getValue()).toBe(
      '123e4567-e89b-12d3-a456-426614174000',
    );
  });

  it('should compare flights for equality', () => {
    const flight1 = FlightFactory.create(flightData);
    const flight2 = FlightFactory.create(flightData);
    const flight3 = FlightFactory.create({
      ...flightData,
      id: '456e7890-e89b-12d3-a456-426614174000',
    });

    expect(flight1.equals(flight2)).toBe(true);
    expect(flight1.equals(flight3)).toBe(false);
  });

  describe('Business Logic Methods', () => {
    describe('changeFlightNumber', () => {
      it('should change flight number successfully', () => {
        const newFlightNumber = new FlightNumber('LA4000');
        const originalUpdatedAt = flight.updatedAt;

        flight.changeFlightNumber(newFlightNumber);

        expect(flight.flightNumber.getValue()).toBe('LA4000');
        expect(flight.updatedAt).not.toEqual(originalUpdatedAt);
      });
    });

    describe('changeAirline', () => {
      it('should change airline successfully', () => {
        const newAirlineId = 'new-airline-id';
        const originalUpdatedAt = flight.updatedAt;

        flight.changeAirline(newAirlineId);

        expect(flight.airlineId).toBe('new-airline-id');
        expect(flight.updatedAt).not.toEqual(originalUpdatedAt);
      });

      it('should throw error when airline ID is empty', () => {
        expect(() => flight.changeAirline('')).toThrow(
          'Airline ID cannot be empty',
        );
      });

      it('should throw error when airline ID is whitespace', () => {
        expect(() => flight.changeAirline('   ')).toThrow(
          'Airline ID cannot be empty',
        );
      });
    });

    describe('changeRoute', () => {
      it('should change route successfully', () => {
        const newOrigin = new IataCode('GRU');
        const newDestination = new IataCode('SDU');
        const originalUpdatedAt = flight.updatedAt;

        flight.changeRoute(newOrigin, newDestination);

        expect(flight.originIata.getValue()).toBe('GRU');
        expect(flight.destinationIata.getValue()).toBe('SDU');
        expect(flight.updatedAt).not.toEqual(originalUpdatedAt);
      });

      it('should throw error when origin equals destination', () => {
        const sameIata = new IataCode('BSB');

        expect(() => flight.changeRoute(sameIata, sameIata)).toThrow(
          'Origin and destination cannot be the same',
        );
      });
    });

    describe('changeSchedule', () => {
      it('should change schedule successfully', () => {
        const newDeparture = new Date('2025-08-01T14:00:00Z');
        const newArrival = new Date('2025-08-01T16:00:00Z');
        const originalUpdatedAt = flight.updatedAt;

        flight.changeSchedule(newDeparture, newArrival);

        expect(flight.departureDatetime).toEqual(newDeparture);
        expect(flight.arrivalDatetime).toEqual(newArrival);
        expect(flight.updatedAt).not.toEqual(originalUpdatedAt);
      });

      it('should throw error when arrival is before departure', () => {
        const departure = new Date('2025-08-01T16:00:00Z');
        const arrival = new Date('2025-08-01T14:00:00Z');

        expect(() => flight.changeSchedule(departure, arrival)).toThrow(
          'Arrival datetime must be after departure datetime',
        );
      });

      it('should throw error when arrival equals departure', () => {
        const sameTime = new Date('2025-08-01T14:00:00Z');

        expect(() => flight.changeSchedule(sameTime, sameTime)).toThrow(
          'Arrival datetime must be after departure datetime',
        );
      });
    });

    describe('changeFrequency', () => {
      it('should change frequency successfully', () => {
        const newFrequency = new Frequency([0, 6]);
        const originalUpdatedAt = flight.updatedAt;

        flight.changeFrequency(newFrequency);

        expect(flight.frequency.getValue()).toEqual([0, 6]);
        expect(flight.updatedAt).not.toEqual(originalUpdatedAt);
      });

      it('should change frequency to daily', () => {
        const dailyFrequency = new Frequency([0, 1, 2, 3, 4, 5, 6]);

        flight.changeFrequency(dailyFrequency);

        expect(flight.frequency.getValue()).toEqual([0, 1, 2, 3, 4, 5, 6]);
      });
    });
  });
});
