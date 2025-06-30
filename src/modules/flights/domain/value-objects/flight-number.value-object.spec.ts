import { FlightNumber } from './flight-number.value-object';

describe('FlightNumber Value Object', () => {
  it('should create valid flight number', () => {
    const flightNumber = new FlightNumber('LA3456');
    expect(flightNumber.getValue()).toBe('LA3456');
  });

  it('should throw error for invalid format', () => {
    expect(() => new FlightNumber('123')).toThrow(
      'Invalid flight number format. Use 2 letters followed by 2-4 digits (ex: LA3456).',
    );
    expect(() => new FlightNumber('LATAM123')).toThrow(
      'Invalid flight number format. Use 2 letters followed by 2-4 digits (ex: LA3456).',
    );
  });

  it('should compare equality correctly', () => {
    const number1 = new FlightNumber('LA3456');
    const number2 = new FlightNumber('LA3456');
    const number3 = new FlightNumber('AD4050');

    expect(number1.equals(number2)).toBe(true);
    expect(number1.equals(number3)).toBe(false);
  });
});
