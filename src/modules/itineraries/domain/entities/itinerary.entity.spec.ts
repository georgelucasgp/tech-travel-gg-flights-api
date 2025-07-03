import { Itinerary } from './itinerary.entity';
import { ItineraryId } from '../value-objects';
import { Flight } from 'src/modules/flights/domain/entities/flight.entity';
import {
  FlightFactory,
  FlightFactoryProps,
} from 'src/modules/flights/application/flight.factory';
import {
  ItineraryFactory,
  ItineraryFactoryProps,
} from '../../application/itinerary.factory';
import { randomUUID } from 'crypto';

describe('Itinerary Entity', () => {
  const createFlightOne = (
    params: Partial<FlightFactoryProps> = {},
  ): Flight => {
    return FlightFactory.create({
      flight_number: params.flight_number || 'LA3456',
      airline_id: params.airline_id || '301cc2b2-f6d2-461f-a284-bf58f00286d3',
      origin_iata: params.origin_iata || 'BSB',
      destination_iata: params.destination_iata || 'CGH',
      departure_datetime:
        params.departure_datetime || new Date('2025-07-01T09:30:00Z'),
      arrival_datetime:
        params.arrival_datetime || new Date('2025-07-01T10:30:00Z'),
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
      flight_number: params.flight_number || 'LA7890',
      airline_id: params.airline_id || '301cc2b2-f6d2-461f-a284-bf58f00286d3',
      origin_iata: params.origin_iata || 'CGH',
      destination_iata: params.destination_iata || 'GIG',
      departure_datetime:
        params.departure_datetime || new Date('2025-07-01T11:15:00Z'),
      arrival_datetime:
        params.arrival_datetime || new Date('2025-07-01T12:05:00Z'),
      frequency: params.frequency || [1, 2, 3, 4, 5],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  };

  const createItinerary = (
    params: Partial<ItineraryFactoryProps> = {},
  ): Itinerary => {
    return ItineraryFactory.create({
      id: params.id || randomUUID(),
      flights: params.flights || [createFlightOne()],
      createdAt: params.createdAt || new Date(),
      updatedAt: params.updatedAt || new Date(),
    });
  };

  describe('create', () => {
    it('should create an itinerary with a single flight', () => {
      const itinerary = createItinerary();
      expect(itinerary).toBeInstanceOf(Itinerary);
      expect(itinerary.flights).toHaveLength(1);
      expect(itinerary.id).toBeInstanceOf(ItineraryId);
    });

    it('should create an itinerary with valid sequence of flights', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const itinerary = Itinerary.create(
        createItinerary({
          flights: [flight1, flight2],
        }),
      );
      expect(itinerary.flights).toHaveLength(2);
      expect(itinerary.originIata).toBe('BSB');
      expect(itinerary.destinationIata).toBe('GIG');
      expect(itinerary.stops).toBe(1);
    });

    it('should throw error for empty flights array', () => {
      expect(() => Itinerary.create(createItinerary({ flights: [] }))).toThrow(
        'Itinerary must have at least one flight',
      );
    });
  });

  describe('Route Sequence Validation', () => {
    it('should throw error when route sequence is broken', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({ origin_iata: 'GRU' });
      expect(() =>
        Itinerary.create(createItinerary({ flights: [flight1, flight2] })),
      ).toThrow(
        'Invalid route sequence: Flight LA3456 destination (CGH) must match next flight LA7890 origin (GRU)',
      );
    });
  });

  describe('Temporal Sequence Validation', () => {
    it('should throw error when next flight departs before current flight arrives', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({
        departure_datetime: new Date('2025-07-01T10:00:00Z'),
        arrival_datetime: new Date('2025-07-01T10:30:00Z'),
      });
      expect(() =>
        Itinerary.create(createItinerary({ flights: [flight1, flight2] })),
      ).toThrow(
        'Invalid temporal sequence: Next flight LA7890 departure (2025-07-01T10:00:00.000Z) must be after current flight LA3456 arrival (2025-07-01T10:30:00.000Z)',
      );
    });

    it('should throw error when next flight departs exactly when current flight arrives', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({
        departure_datetime: new Date('2025-07-01T10:30:00Z'),
      });
      expect(() =>
        Itinerary.create(createItinerary({ flights: [flight1, flight2] })),
      ).toThrow('Invalid temporal sequence');
    });
  });

  describe('Connection Time Validation', () => {
    it('should throw error when connection time is less than 45 minutes', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo({
        departure_datetime: new Date('2025-07-01T10:50:00Z'),
        arrival_datetime: new Date('2025-07-01T12:00:00Z'),
      });
      expect(() =>
        Itinerary.create(createItinerary({ flights: [flight1, flight2] })),
      ).toThrow(
        'Insufficient connection time: 20.0 minutes between flight LA3456 and LA7890. Minimum required: 45 minutes',
      );
    });

    it('should accept exactly 45 minutes connection time', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      expect(() =>
        Itinerary.create(createItinerary({ flights: [flight1, flight2] })),
      ).not.toThrow();
    });

    it('should accept more than 45 minutes connection time', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      expect(() =>
        Itinerary.create(createItinerary({ flights: [flight1, flight2] })),
      ).not.toThrow();
    });
  });

  describe('Computed Properties', () => {
    it('should calculate origin and destination IATA codes correctly', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const itinerary = Itinerary.create(
        createItinerary({ flights: [flight1, flight2] }),
      );
      expect(itinerary.originIata).toBe('BSB');
      expect(itinerary.destinationIata).toBe('GIG');
    });

    it('should calculate departure and arrival times correctly', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const itinerary = Itinerary.create(
        createItinerary({ flights: [flight1, flight2] }),
      );
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
      const itinerary = Itinerary.create(
        createItinerary({ flights: [flight1, flight2] }),
      );
      expect(itinerary.totalDurationMinutes).toBe(155);
    });

    it('should calculate stops correctly', () => {
      const flight1 = createFlightOne();
      const flight2 = createFlightTwo();
      const singleFlightItinerary = Itinerary.create(
        createItinerary({ flights: [flight1] }),
      );
      const twoFlightItinerary = Itinerary.create(
        createItinerary({ flights: [flight1, flight2] }),
      );
      expect(singleFlightItinerary.stops).toBe(0);
      expect(twoFlightItinerary.stops).toBe(1);
    });
  });
});
