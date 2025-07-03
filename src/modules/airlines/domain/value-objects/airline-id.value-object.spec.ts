import { AirlineId } from './airline-id.value-object';

describe('AirlineId', () => {
  it('should create with a valid UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = AirlineId.create(uuid);
    expect(id.getValue()).toBe(uuid);
  });

  it('should throw for invalid UUID', () => {
    expect(() => AirlineId.create('invalid')).toThrow();
    expect(() => AirlineId.create('')).toThrow();
  });

  it('should compare equality correctly', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id1 = AirlineId.create(uuid);
    const id2 = AirlineId.create(uuid);
    const id3 = AirlineId.create();
    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
