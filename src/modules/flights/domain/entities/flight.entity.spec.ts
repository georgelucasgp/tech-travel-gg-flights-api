import { Flight } from './flight.entity';
import { FlightNumber, IataCode, Frequency, FlightId } from '../value-objects';
import { TestFlightFactory } from '../../../../../test/factories/flight.factory';

describe('Flight Entity', () => {
  it('should create a flight with all required properties', () => {
    const newFlight = TestFlightFactory.create();

    expect(newFlight).toBeInstanceOf(Flight);
  });

  it('should create flight with provided id', () => {
    const newFlight = TestFlightFactory.create({
      id: new FlightId('123e4567-e89b-12d3-a456-426614174000'),
    });
    expect(newFlight.id.getValue()).toBe(
      '123e4567-e89b-12d3-a456-426614174000',
    );
  });

  it('should compare flights for equality', () => {
    const flightId = new FlightId('123e4567-e89b-12d3-a456-426614174000');

    const flight1 = TestFlightFactory.create({ id: flightId });
    const flight2 = TestFlightFactory.create({ id: flightId });
    const flight3 = TestFlightFactory.create({
      id: new FlightId('456e7890-e89b-12d3-a456-426614174000'),
    });

    expect(flight1.equals(flight2)).toBe(true);
    expect(flight1.equals(flight3)).toBe(false);
  });

  describe('Business Logic Methods', () => {
    describe('changeFlightNumber', () => {
      it('should change flight number successfully', () => {
        const flight = TestFlightFactory.create();
        const newFlightNumber = new FlightNumber('LA4000');
        const originalUpdatedAt = flight.updatedAt;

        flight.changeFlightNumber(newFlightNumber);

        expect(flight.flightNumber.getValue()).toBe('LA4000');
        expect(flight.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });
    });

    describe('changeAirline', () => {
      it('should change airline successfully', () => {
        const flight = TestFlightFactory.create();
        const newAirlineId = '123e4567-e89b-12d3-a456-426614174000';
        const originalUpdatedAt = flight.updatedAt;

        flight.changeAirline(newAirlineId);

        expect(flight.airlineId).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(flight.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });

      it('should throw error when airline ID is empty', () => {
        const flight = TestFlightFactory.create();
        expect(() => flight.changeAirline('')).toThrow(
          'Airline ID cannot be empty',
        );
      });

      it('should throw error when airline ID is whitespace', () => {
        const flight = TestFlightFactory.create();
        expect(() => flight.changeAirline('   ')).toThrow(
          'Airline ID cannot be empty',
        );
      });
    });

    describe('changeRoute', () => {
      it('should change route successfully', () => {
        const flight = TestFlightFactory.create();
        const newOrigin = new IataCode('IMP');
        const newDestination = new IataCode('BSB');
        const originalUpdatedAt = flight.updatedAt;

        flight.changeRoute(newOrigin, newDestination);

        expect(flight.originIata.getValue()).toBe('IMP');
        expect(flight.destinationIata.getValue()).toBe('BSB');
        expect(flight.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });

      it('should throw error when origin equals destination', () => {
        const flight = TestFlightFactory.create();
        const sameIata = new IataCode('BSB');
        expect(() => flight.changeRoute(sameIata, sameIata)).toThrow(
          'Origin and destination cannot be the same',
        );
      });
    });

    describe('changeSchedule', () => {
      it('should change schedule successfully', () => {
        const flight = TestFlightFactory.create();
        const newDeparture = new Date('2025-08-01T14:00:00Z');
        const newArrival = new Date('2025-08-01T16:00:00Z');
        const originalUpdatedAt = flight.updatedAt;

        flight.changeSchedule(newDeparture, newArrival);

        expect(flight.departureDatetime).toEqual(newDeparture);
        expect(flight.arrivalDatetime).toEqual(newArrival);
        expect(flight.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });

      it('should throw error when arrival is before departure', () => {
        const flight = TestFlightFactory.create();
        const departure = new Date('2025-08-01T16:00:00Z');
        const arrival = new Date('2025-08-01T14:00:00Z');

        expect(() => flight.changeSchedule(departure, arrival)).toThrow(
          'Arrival datetime must be after departure datetime',
        );
      });

      it('should throw error when arrival equals departure', () => {
        const flight = TestFlightFactory.create();
        const sameTime = new Date('2025-08-01T14:00:00Z');

        expect(() => flight.changeSchedule(sameTime, sameTime)).toThrow(
          'Arrival datetime must be after departure datetime',
        );
      });
    });

    describe('changeFrequency', () => {
      it('should change frequency successfully', () => {
        const flight = TestFlightFactory.create();
        const newFrequency = new Frequency([0, 6]);
        const originalUpdatedAt = flight.updatedAt;

        flight.changeFrequency(newFrequency);

        expect(flight.frequency.getValue()).toEqual([0, 6]);
        expect(flight.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });

      it('should change frequency to daily', () => {
        const flight = TestFlightFactory.create();
        const dailyFrequency = new Frequency([0, 1, 2, 3, 4, 5, 6]);
        flight.changeFrequency(dailyFrequency);
        expect(flight.frequency.getValue()).toEqual([0, 1, 2, 3, 4, 5, 6]);
      });
    });
  });
});
