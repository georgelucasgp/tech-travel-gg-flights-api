import { BookingCode } from './booking-code.value-object';
import { BadRequestException } from '@nestjs/common';

describe('BookingCode', () => {
  it('should create a valid booking code', () => {
    const code = BookingCode.create('ABC123');
    expect(code.getValue()).toBe('ABC123');
    expect(code.toString()).toBe('ABC123');
  });

  it('should throw for invalid code (length)', () => {
    expect(() => BookingCode.create('AB12')).toThrow(BadRequestException);
  });

  it('should throw for invalid code (chars)', () => {
    expect(() => BookingCode.create('AB@123')).toThrow(BadRequestException);
  });

  it('should generate a random code if not provided', () => {
    const code = BookingCode.create();
    expect(code.getValue()).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('should compare equality', () => {
    const code1 = BookingCode.create('ZZZZ99');
    const code2 = BookingCode.create('ZZZZ99');
    const code3 = BookingCode.create('AAAA11');
    expect(code1.equals(code2)).toBe(true);
    expect(code1.equals(code3)).toBe(false);
  });
});
