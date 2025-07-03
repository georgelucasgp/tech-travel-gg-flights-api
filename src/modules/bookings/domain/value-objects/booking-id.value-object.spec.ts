import { BookingId } from './booking-id.value-object';
import { BadRequestException } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

describe('BookingId', () => {
  it('should create a valid BookingId from uuid', () => {
    const uuid = 'b7e6b2e2-8c2e-4e2a-9b2e-8c2e4e2a9b2e';
    const id = BookingId.create(uuid);
    expect(id.getValue()).toBe(uuid);
    expect(id.toString()).toBe(uuid);
    expect(uuidValidate(id.getValue())).toBe(true);
  });

  it('should throw for invalid uuid', () => {
    expect(() => BookingId.create('invalid')).toThrow(BadRequestException);
  });

  it('should generate a random uuid if not provided', () => {
    const id = BookingId.create();
    expect(uuidValidate(id.getValue())).toBe(true);
  });

  it('should compare equality', () => {
    const id1 = BookingId.create('b7e6b2e2-8c2e-4e2a-9b2e-8c2e4e2a9b2e');
    const id2 = BookingId.create('b7e6b2e2-8c2e-4e2a-9b2e-8c2e4e2a9b2e');
    const id3 = BookingId.create();
    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
