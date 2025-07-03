import { AirlineIataCode } from './airline-iata-code.value-object';

describe('AirlineIataCode', () => {
  it('should create with a valid 2-letter code', () => {
    const code = 'LA';
    const iata = new AirlineIataCode(code);
    expect(iata.getValue()).toBe(code);
  });

  it('should create with a valid 2-char code with numbers', () => {
    expect(new AirlineIataCode('G3').getValue()).toBe('G3');
    expect(new AirlineIataCode('2Z').getValue()).toBe('2Z');
    expect(new AirlineIataCode('8V').getValue()).toBe('8V');
    expect(new AirlineIataCode('AZ').getValue()).toBe('AZ');
  });

  it('should throw for invalid codes', () => {
    expect(() => new AirlineIataCode('')).toThrow();
    expect(() => new AirlineIataCode('L')).toThrow();
    expect(() => new AirlineIataCode('LAT')).toThrow();
    expect(() => new AirlineIataCode('la')).toThrow();
    expect(() => new AirlineIataCode('!@')).toThrow();
    expect(() => new AirlineIataCode('A1!')).toThrow();
  });

  it('should compare equality correctly', () => {
    const c1 = new AirlineIataCode('LA');
    const c2 = new AirlineIataCode('LA');
    const c3 = new AirlineIataCode('AZ');
    expect(c1.equals(c2)).toBe(true);
    expect(c1.equals(c3)).toBe(false);
  });
});
