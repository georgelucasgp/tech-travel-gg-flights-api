import { Airline } from './airline.entity';
import { AirlineId } from '../value-objects';
import {
  AirlineFactory,
  AirlineFactoryProps,
} from '../../application/airline.factory';
import { randomUUID } from 'crypto';

describe('Airline Entity', () => {
  const createAirline = (
    params: Partial<AirlineFactoryProps> = {},
  ): Airline => {
    return AirlineFactory.create({
      id: params.id || randomUUID(),
      name: params.name || 'LATAM Airlines',
      iata_code: params.iata_code || 'LA',
      createdAt: params.createdAt || new Date(),
      updatedAt: params.updatedAt || new Date(),
      deletedAt: params.deletedAt || null,
    });
  };

  describe('create', () => {
    it('should create an airline with all required properties', () => {
      const airline = createAirline();

      expect(airline).toBeInstanceOf(Airline);
    });

    it('should create an airline with valid data including ID', () => {
      const airline = createAirline({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'TAM Airlines',
        iata_code: 'TA',
      });

      expect(airline).toBeInstanceOf(Airline);
      expect(airline.id.getValue()).toBe(
        '123e4567-e89b-12d3-a456-426614174000',
      );
      expect(airline.name.getValue()).toBe('TAM Airlines');
      expect(airline.iataCode.getValue()).toBe('TA');
    });

    it('should create an airline with specific ID when provided', () => {
      const specificId = AirlineId.create(
        '123e4567-e89b-12d3-a456-426614174000',
      );
      const airline = createAirline({
        id: specificId.getValue(),
      });

      expect(airline.id.getValue()).toBe(specificId.getValue());
    });
  });

  describe('Business Logic Methods', () => {
    describe('update', () => {
      it('should update the updatedAt timestamp', () => {
        const airline = createAirline();
        const originalUpdatedAt = airline.updatedAt;

        airline.update();

        expect(airline.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });
    });

    describe('isDeleted', () => {
      it('should return false for non-deleted airline', () => {
        const airline = createAirline();
        expect(airline.isDeleted()).toBe(false);
      });

      it('should return true for deleted airline', () => {
        const airline = createAirline({
          deletedAt: new Date(),
        });

        expect(airline.isDeleted()).toBe(true);
      });
    });
  });
});
