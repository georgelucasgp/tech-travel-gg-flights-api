import { Flight } from './flight.entity';
import { FlightNumber, IataCode, Frequency } from '../value-objects';
import { FlightFactory, FlightProps } from '../../application/flight.factory';
import { randomUUID } from 'crypto';

describe('Flight Entity', () => {
  const createFlight = (params: Partial<FlightProps> = {}): Flight => {
    return FlightFactory.create({
      id: params.id || randomUUID(),
      flightNumber: params.flightNumber || 'LA3456',
      airlineId: params.airlineId || 'airline-1',
      originIata: params.originIata || 'BSB',
      destinationIata: params.destinationIata || 'CGH',
      departureDatetime:
        params.departureDatetime || new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime:
        params.arrivalDatetime || new Date('2025-07-01T10:30:00Z'),
      frequency: params.frequency || [1, 2, 3, 4, 5],
      createdAt: params.createdAt || new Date(),
      updatedAt: params.updatedAt || new Date(),
      deletedAt: params.deletedAt || null,
    });
  };

  it('should create a flight with all required properties', () => {
    const newFlight = createFlight();

    expect(newFlight).toBeInstanceOf(Flight);
  });

  it('should create flight with provided id', () => {
    const newFlight = createFlight({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(newFlight.id.getValue()).toBe(
      '123e4567-e89b-12d3-a456-426614174000',
    );
  });

  it('should compare flights for equality', () => {
    const flightId = '123e4567-e89b-12d3-a456-426614174000';

    const flight1 = createFlight({ id: flightId });
    const flight2 = createFlight({ id: flightId });
    const flight3 = createFlight({
      id: '456e7890-e89b-12d3-a456-426614174000',
    });

    expect(flight1.equals(flight2)).toBe(true);
    expect(flight1.equals(flight3)).toBe(false);
  });

  describe('Business Logic Methods', () => {
    describe('changeFlightNumber', () => {
      it('should change flight number successfully', () => {
        const flight = createFlight();
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
        const flight = createFlight();
        const newAirlineId = '123e4567-e89b-12d3-a456-426614174000';
        const originalUpdatedAt = flight.updatedAt;

        flight.changeAirline(newAirlineId);

        expect(flight.airlineId).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(flight.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });

      it('should throw error when airline ID is empty', () => {
        const flight = createFlight();
        expect(() => flight.changeAirline('')).toThrow(
          'Airline ID cannot be empty',
        );
      });

      it('should throw error when airline ID is whitespace', () => {
        const flight = createFlight();
        expect(() => flight.changeAirline('   ')).toThrow(
          'Airline ID cannot be empty',
        );
      });
    });

    describe('changeRoute', () => {
      it('should change route successfully', () => {
        const flight = createFlight();
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
        const flight = createFlight();
        const sameIata = new IataCode('BSB');
        expect(() => flight.changeRoute(sameIata, sameIata)).toThrow(
          'Origin and destination cannot be the same',
        );
      });
    });

    describe('changeSchedule', () => {
      it('should change schedule successfully', () => {
        const flight = createFlight();
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
        const flight = createFlight();
        const departure = new Date('2025-08-01T16:00:00Z');
        const arrival = new Date('2025-08-01T14:00:00Z');

        expect(() => flight.changeSchedule(departure, arrival)).toThrow(
          'Arrival datetime must be after departure datetime',
        );
      });

      it('should throw error when arrival equals departure', () => {
        const flight = createFlight();
        const sameTime = new Date('2025-08-01T14:00:00Z');

        expect(() => flight.changeSchedule(sameTime, sameTime)).toThrow(
          'Arrival datetime must be after departure datetime',
        );
      });
    });

    describe('changeFrequency', () => {
      it('should change frequency successfully', () => {
        const flight = createFlight();
        const newFrequency = new Frequency([0, 6]);
        const originalUpdatedAt = flight.updatedAt;

        flight.changeFrequency(newFrequency);

        expect(flight.frequency.getValue()).toEqual([0, 6]);
        expect(flight.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });

      it('should change frequency to daily', () => {
        const flight = createFlight();
        const dailyFrequency = new Frequency([0, 1, 2, 3, 4, 5, 6]);
        flight.changeFrequency(dailyFrequency);
        expect(flight.frequency.getValue()).toEqual([0, 1, 2, 3, 4, 5, 6]);
      });
    });
  });
});
