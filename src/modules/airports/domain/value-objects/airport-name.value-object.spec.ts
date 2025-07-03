import { AirportName } from './airport-name.value-object';

describe('AirportName', () => {
  it('should create a valid AirportName', () => {
    const airportName = new AirportName('Aeroporto Internacional de Brasília');

    expect(airportName.getValue()).toBe('Aeroporto Internacional de Brasília');
  });

  it('should throw error for names shorter than 5 characters', () => {
    expect(() => new AirportName('Test')).toThrow(
      'Airport name must have at least 5 characters',
    );
  });

  it('should throw error for names longer than 200 characters', () => {
    const longName = 'A'.repeat(201);
    expect(() => new AirportName(longName)).toThrow(
      'Airport name cannot exceed 200 characters',
    );
  });

  it('should compare equality correctly', () => {
    const name = 'São Paulo International Airport';
    const airportName1 = new AirportName(name);
    const airportName2 = new AirportName(name);

    expect(airportName1.equals(airportName2)).toBe(true);
  });
});
