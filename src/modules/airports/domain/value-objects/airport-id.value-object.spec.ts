import { AirportId } from './airport-id.value-object';
import { randomUUID } from 'crypto';

describe('AirportId', () => {
  it('should create a valid AirportId with valid UUID', () => {
    const validUuid = randomUUID();
    const airportId = new AirportId(validUuid);

    expect(airportId.getValue()).toBe(validUuid);
  });

  it('should generate new UUID when calling create without params', () => {
    const airportId = AirportId.create();

    expect(airportId.getValue()).toBeDefined();
    expect(typeof airportId.getValue()).toBe('string');
  });

  it('should throw error for invalid UUID format', () => {
    expect(() => new AirportId('invalid-uuid')).toThrow(
      'Airport ID must be a valid UUID',
    );
  });

  it('should compare equality correctly', () => {
    const uuid = randomUUID();
    const airportId1 = new AirportId(uuid);
    const airportId2 = new AirportId(uuid);

    expect(airportId1.equals(airportId2)).toBe(true);
  });
});
