import { AirportCity } from './airport-city.value-object';

describe('AirportCity', () => {
  it('should create a valid city', () => {
    const city = new AirportCity('Brasília');
    expect(city.getValue()).toBe('Brasília');
  });

  it('should throw error for city with less than 2 characters', () => {
    expect(() => new AirportCity('A')).toThrow(
      'Airport city must have at least 2 characters',
    );
  });

  it('should throw error for city with more than 100 characters', () => {
    const longCity = 'A'.repeat(101);
    expect(() => new AirportCity(longCity)).toThrow(
      'Airport city cannot exceed 100 characters',
    );
  });

  it('should compare equality correctly', () => {
    const a = new AirportCity('São Paulo');
    const b = new AirportCity('São Paulo');
    expect(a.equals(b)).toBe(true);
  });
});
