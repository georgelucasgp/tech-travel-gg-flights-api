import { randomUUID } from 'crypto';
import { FlightId } from './flight-id.value-object';

describe('FlightId Value Object', () => {
  it('should create valid flight ID', () => {
    const validUuid = randomUUID();
    const flightId = new FlightId(validUuid);
    expect(flightId.getValue()).toBe(validUuid);
  });

  it('should throw error for invalid UUID', () => {
    expect(() => new FlightId('invalid-uuid')).toThrow(
      'Flight ID must be a valid UUID',
    );
  });

  it('should compare equality correctly', () => {
    const uuid = randomUUID();
    const id1 = new FlightId(uuid);
    const id2 = new FlightId(uuid);
    const id3 = new FlightId(randomUUID());

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
