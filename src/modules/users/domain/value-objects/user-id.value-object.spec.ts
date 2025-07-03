import { UserId } from './user-id.value-object';

describe('UserId', () => {
  it('should create with a valid UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = UserId.create(uuid);
    expect(id.getValue()).toBe(uuid);
  });

  it('should throw for invalid UUID', () => {
    expect(() => UserId.create('invalid')).toThrow();
    expect(() => UserId.create('')).toThrow();
  });

  it('should compare equality correctly', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id1 = UserId.create(uuid);
    const id2 = UserId.create(uuid);
    const id3 = UserId.create();
    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
