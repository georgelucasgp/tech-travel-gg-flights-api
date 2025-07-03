import { AirportCountry } from './airport-country.value-object';

describe('AirportCountry', () => {
  it('should create a valid country', () => {
    const country = new AirportCountry('Brasil');
    expect(country.getValue()).toBe('Brasil');
  });

  it('should throw error for country with less than 2 characters', () => {
    expect(() => new AirportCountry('B')).toThrow(
      'Airport country must have at least 2 characters',
    );
  });

  it('should throw error for country with more than 100 characters', () => {
    const longCountry = 'A'.repeat(101);
    expect(() => new AirportCountry(longCountry)).toThrow(
      'Airport country cannot exceed 100 characters',
    );
  });

  it('should compare equality correctly', () => {
    const a = new AirportCountry('Brasil');
    const b = new AirportCountry('Brasil');
    expect(a.equals(b)).toBe(true);
  });
});
