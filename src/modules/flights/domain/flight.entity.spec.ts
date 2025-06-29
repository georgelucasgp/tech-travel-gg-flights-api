import { Flight } from './flight.entity';

describe('Flight Entity', () => {
  it('should throw an error if flight number is invalid', () => {
    const invalidProps = {
      flightNumber: '3000ABC',
      airlineId: '550e8400-e29b-41d4-a716-446655440000',
      originIata: 'IMP',
      destinationIata: 'BSB',
      departureDatetime: new Date('2025-10-01T10:00:00Z'),
      arrivalDatetime: new Date('2025-10-01T12:00:00Z'),
      frequency: [1, 2, 3],
    };

    expect(() => {
      Flight.create(invalidProps);
    }).toThrow('Flight number is invalid');
  });

  it('should throw an error if origin IATA code is invalid', () => {
    const invalidProps = {
      flightNumber: 'LA300',
      airlineId: '550e8400-e29b-41d4-a716-446655440000',
      originIata: '0000',
      destinationIata: 'BSB',
      departureDatetime: new Date('2025-10-01T10:00:00Z'),
      arrivalDatetime: new Date('2025-10-01T12:00:00Z'),
      frequency: [1, 2, 3],
    };

    expect(() => {
      Flight.create(invalidProps);
    }).toThrow('IATA codes are invalid');
  });

  it('should throw an error if destination IATA code is invalid', () => {
    const invalidProps = {
      flightNumber: 'LA300',
      airlineId: '550e8400-e29b-41d4-a716-446655440000',
      originIata: 'IMP',
      destinationIata: '0000',
      departureDatetime: new Date('2025-10-01T10:00:00Z'),
      arrivalDatetime: new Date('2025-10-01T12:00:00Z'),
      frequency: [1, 2, 3],
    };

    expect(() => {
      Flight.create(invalidProps);
    }).toThrow('IATA codes are invalid');
  });

  it('should throw an error if arrival datetime is before departure datetime', () => {
    const invalidProps = {
      flightNumber: 'LA300',
      airlineId: '550e8400-e29b-41d4-a716-446655440000',
      originIata: 'IMP',
      destinationIata: 'BSB',
      departureDatetime: new Date('2025-10-01T12:00:00Z'),
      arrivalDatetime: new Date('2025-10-01T10:00:00Z'),
      frequency: [1, 2, 3],
    };

    expect(() => {
      Flight.create(invalidProps);
    }).toThrow('Arrival datetime must be after departure datetime');
  });

  it('should throw an error if origin and destination are the same', () => {
    const invalidProps = {
      flightNumber: 'LA300',
      airlineId: '550e8400-e29b-41d4-a716-446655440000',
      originIata: 'IMP',
      destinationIata: 'IMP',
      departureDatetime: new Date('2025-10-01T10:00:00Z'),
      arrivalDatetime: new Date('2025-10-01T12:00:00Z'),
      frequency: [1, 2, 3],
    };

    expect(() => {
      Flight.create(invalidProps);
    }).toThrow('Origin and destination cannot be the same');
  });

  it('should create a flight instance successfully with valid properties', () => {
    const validProps = {
      flightNumber: 'LA3000',
      airlineId: '550e8400-e29b-41d4-a716-446655440000',
      originIata: 'IMP',
      destinationIata: 'BSB',
      departureDatetime: new Date('2025-10-01T10:00:00Z'),
      arrivalDatetime: new Date('2025-10-01T12:00:00Z'),
      frequency: [1, 2, 3],
    };

    const flight = Flight.create(validProps);

    expect(flight).toBeInstanceOf(Flight);
  });
});
