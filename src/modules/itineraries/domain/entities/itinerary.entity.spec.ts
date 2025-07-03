import { Itinerary } from './itinerary.entity';
import { ItineraryId } from '../value-objects';
import { Flight } from 'src/modules/flights/domain/entities/flight.entity';
import {
  FlightFactory,
  FlightFactoryProps,
} from 'src/modules/flights/application/flight.factory';

describe('Itinerary Entity', () => {
  const createFlightOne = (
    params: Partial<FlightFactoryProps> = {},
  ): Flight => {
    return FlightFactory.create({
      flightNumber: params.flightNumber || 'LA3456',
      airlineId: params.airlineId || 'airline-1',
      originIata: params.originIata || 'BSB',
      destinationIata: params.destinationIata || 'CGH',
      departureDatetime:
        params.departureDatetime || new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime:
        params.arrivalDatetime || new Date('2025-07-01T10:30:00Z'),
      frequency: params.frequency || [1, 2, 3, 4, 5],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  };

  const createFlightTwo = (
    params: Partial<FlightFactoryProps> = {},
  ): Flight => {
    return FlightFactory.create({
      flightNumber: params.flightNumber || 'LA7890',
      airlineId: params.airlineId || 'airline-2',
      originIata: params.originIata || 'CGH',
      destinationIata: params.destinationIata || 'GIG',
      departureDatetime:
        params.departureDatetime || new Date('2025-07-01T11:15:00Z'),
      arrivalDatetime:
        params.arrivalDatetime || new Date('2025-07-01T12:05:00Z'),
      frequency: params.frequency || [1, 2, 3, 4, 5],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  };

  describe('create', () => {
    it('should create an itinerary with a single flight', () => {
      const flight = createFlightOne();
      const itinerary = Itinerary.create([flight]);
      expect(itinerary).toBeInstanceOf(Itinerary);
      expect(itinerary.flights).toHaveLength(1);
      expect(itinerary.flights[0]).toBe(flight);
      expect(itinerary.id).toBeInstanceOf(ItineraryId);
    });

    it('should create an itinerary with valid sequence of flights', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const itinerary = Itinerary.create([flight1, flight2]);
      expect(itinerary.flights).toHaveLength(2);
      expect(itinerary.originIata).toBe('BSB');
      expect(itinerary.destinationIata).toBe('GIG');
      expect(itinerary.stops).toBe(1);
    });

    it('should throw error for empty flights array', () => {
      expect(() => Itinerary.create([])).toThrow(
        'Itinerary must have at least one flight',
      );
    });

    it('should throw error for null flights array', () => {
      expect(() => Itinerary.create(null as any)).toThrow(
        'Itinerary must have at least one flight',
      );
    });

    it('should throw error for undefined flights array', () => {
      expect(() => Itinerary.create(undefined as any)).toThrow(
        'Itinerary must have at least one flight',
      );
    });
  });

  describe('route sequence validation', () => {
    it('should throw error when route sequence is broken', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({ originIata: 'GRU' });
      expect(() => Itinerary.create([flight1, flight2])).toThrow(
        'Invalid route sequence: Flight LA3456 destination (CGH) must match next flight LA7890 origin (GRU)',
      );
    });
  });

  describe('temporal sequence validation', () => {
    it('should throw error when next flight departs before current flight arrives', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({
        departureDatetime: new Date('2025-07-01T10:00:00Z'),
        arrivalDatetime: new Date('2025-07-01T10:30:00Z'),
      });
      expect(() => Itinerary.create([flight1, flight2])).toThrow(
        'Invalid temporal sequence: Next flight LA7890 departure (2025-07-01T10:00:00.000Z) must be after current flight LA3456 arrival (2025-07-01T10:30:00.000Z)',
      );
    });

    it('should throw error when next flight departs exactly when current flight arrives', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({
        departureDatetime: new Date('2025-07-01T10:30:00Z'),
      });
      expect(() => Itinerary.create([flight1, flight2])).toThrow(
        'Invalid temporal sequence',
      );
    });
  });

  describe('connection time validation', () => {
    it('should throw error when connection time is less than 45 minutes', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({
        departureDatetime: new Date('2025-07-01T10:50:00Z'),
        arrivalDatetime: new Date('2025-07-01T12:00:00Z'),
      });
      expect(() => Itinerary.create([flight1, flight2])).toThrow(
        'Insufficient connection time: 20.0 minutes between flight LA3456 and LA7890. Minimum required: 45 minutes',
      );
    });

    it('should accept exactly 45 minutes connection time', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      expect(() => Itinerary.create([flight1, flight2])).not.toThrow();
    });

    it('should accept more than 45 minutes connection time', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      expect(() => Itinerary.create([flight1, flight2])).not.toThrow();
    });
  });

  describe('computed properties', () => {
    it('should calculate origin and destination IATA codes correctly', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const itinerary = Itinerary.create([flight1, flight2]);
      expect(itinerary.originIata).toBe('BSB');
      expect(itinerary.destinationIata).toBe('GIG');
    });

    it('should calculate departure and arrival times correctly', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const itinerary = Itinerary.create([flight1, flight2]);
      expect(itinerary.departureDateTime).toEqual(
        new Date('2025-07-01T09:30:00Z'),
      );
      expect(itinerary.arrivalDateTime).toEqual(
        new Date('2025-07-01T12:05:00Z'),
      );
    });

    it('should calculate total duration correctly', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const itinerary = Itinerary.create([flight1, flight2]);
      expect(itinerary.totalDurationMinutes).toBe(155);
    });

    it('should calculate stops correctly', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const singleFlightItinerary = Itinerary.create([flight1]);
      const twoFlightItinerary = Itinerary.create([flight1, flight2]);
      expect(singleFlightItinerary.stops).toBe(0);
      expect(twoFlightItinerary.stops).toBe(1);
    });
  });

  describe('soft delete', () => {
    it('should mark itinerary as deleted', () => {
      const flight = createFlightOne();
      const itinerary = Itinerary.create([flight]);
      expect(itinerary.isDeleted()).toBe(false);
      expect(itinerary.deletedAt).toBeNull();
      itinerary.markAsDeleted();
      expect(itinerary.isDeleted()).toBe(true);
      expect(itinerary.deletedAt).toBeInstanceOf(Date);
      expect(itinerary.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('immutability', () => {
    it('should return a copy of flights array to maintain immutability', () => {
      const flight = createFlightOne();
      const itinerary = Itinerary.create([flight]);
      const flightsFromGetter = itinerary.flights;
      flightsFromGetter.push(flight);
      expect(itinerary.flights).toHaveLength(1);
    });
  });
});
