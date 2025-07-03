import { AirportTimezone } from './airport-timezone.value-object';

describe('AirportTimezone', () => {
  it('should create a valid timezone', () => {
    const tz = new AirportTimezone('America/Sao_Paulo');
    expect(tz.getValue()).toBe('America/Sao_Paulo');
  });

  it('should throw error for empty timezone', () => {
    expect(() => new AirportTimezone('')).toThrow(
      'Airport timezone cannot be empty',
    );
  });

  it('should throw error for invalid timezone', () => {
    expect(() => new AirportTimezone('@@@')).toThrow(
      'Airport timezone must be a valid timezone format',
    );
  });

  it('should compare equality correctly', () => {
    const a = new AirportTimezone('UTC');
    const b = new AirportTimezone('UTC');
    expect(a.equals(b)).toBe(true);
  });
});
