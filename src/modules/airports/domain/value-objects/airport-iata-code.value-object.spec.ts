import { AirportIataCode } from './airport-iata-code.value-object';

describe('AirportIataCode', () => {
  it('should create a valid IATA code', () => {
    const iata = new AirportIataCode('BSB');
    expect(iata.getValue()).toBe('BSB');
  });

  it('should normalize to uppercase', () => {
    const iata = new AirportIataCode('gru');
    expect(iata.getValue()).toBe('GRU');
  });

  it('should throw error for invalid code', () => {
    expect(() => new AirportIataCode('12')).toThrow(
      'IATA code must be exactly 3 uppercase letters',
    );
    expect(() => new AirportIataCode('abcd')).toThrow(
      'IATA code must be exactly 3 uppercase letters',
    );
    expect(() => new AirportIataCode('A1!')).toThrow(
      'IATA code must be exactly 3 uppercase letters',
    );
  });

  it('should compare equality correctly', () => {
    const a = new AirportIataCode('IMP');
    const b = new AirportIataCode('IMP');
    expect(a.equals(b)).toBe(true);
  });
});
