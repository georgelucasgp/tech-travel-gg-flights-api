import { Airport } from './airport.entity';
import { randomUUID } from 'crypto';
import {
  AirportFactory,
  AirportFactoryProps,
} from '../../application/airport.factory';

describe('Airport Entity', () => {
  const createAirport = (
    params: Partial<AirportFactoryProps> = {},
  ): Airport => {
    return AirportFactory.create({
      id: params.id || randomUUID(),
      name: params.name || 'Aeroporto Internacional de Brasília',
      iataCode: params.iataCode || 'BSB',
      city: params.city || 'Brasília',
      country: params.country || 'Brasil',
      timezone: params.timezone || 'America/Sao_Paulo',
      createdAt: params.createdAt || new Date('2025-01-01T10:00:00Z'),
      updatedAt: params.updatedAt || new Date('2025-01-01T10:00:00Z'),
      deletedAt: params.deletedAt || null,
    });
  };

  it('should create a valid airport', () => {
    const airport = createAirport();
    expect(airport).toBeInstanceOf(Airport);
  });

  it('should compare equality by id', () => {
    const airport1 = createAirport();
    const airport2 = createAirport({ id: airport1.id.getValue() });
    expect(airport1.equals(airport2)).toBe(true);
  });

  it('toString should return a readable representation', () => {
    const airport = createAirport();
    expect(airport.toString()).toContain(airport.id.getValue());
    expect(airport.toString()).toContain(airport.name.getValue());
    expect(airport.toString()).toContain(airport.iataCode.getValue());
  });
});
