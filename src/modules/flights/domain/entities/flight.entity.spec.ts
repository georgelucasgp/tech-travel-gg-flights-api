import { Flight } from './flight.entity';

describe('Flight Entity', () => {
  it('should create a flight with all required properties', () => {
    const flightData = {
      flightNumber: 'LA3456',
      airlineId: 'airline-123',
      originIata: 'BSB',
      destinationIata: 'GIG',
      departureDatetime: new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime: new Date('2025-07-01T12:05:00Z'),
      frequency: [1, 3, 5],
    };

    const flight = Flight.create(flightData);

    expect(flight).toBeInstanceOf(Flight);
  });

  it('should create flight with provided id', () => {
    const flightData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      flightNumber: 'LA3456',
      airlineId: 'airline-123',
      originIata: 'BSB',
      destinationIata: 'GIG',
      departureDatetime: new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime: new Date('2025-07-01T12:05:00Z'),
      frequency: [1, 3, 5],
    };

    const flight = Flight.create(flightData);

    expect(flight.id.getValue()).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('should compare flights for equality', () => {
    const flightData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      flightNumber: 'LA3456',
      airlineId: 'airline-123',
      originIata: 'BSB',
      destinationIata: 'GIG',
      departureDatetime: new Date('2025-07-01T09:30:00Z'),
      arrivalDatetime: new Date('2025-07-01T12:05:00Z'),
      frequency: [1, 3, 5],
    };

    const flight1 = Flight.create(flightData);
    const flight2 = Flight.create(flightData);
    const flight3 = Flight.create({
      ...flightData,
      id: '456e7890-e89b-12d3-a456-426614174000',
    });

    expect(flight1.equals(flight2)).toBe(true);
    expect(flight1.equals(flight3)).toBe(false);
  });
});
