import { AirlineName } from './airline-name.value-object';

describe('AirlineName', () => {
  it('should create with a valid name', () => {
    const name = 'LATAM Airlines';
    const airlineName = new AirlineName(name);
    expect(airlineName.getValue()).toBe(name);
  });

  it('should throw for empty or too short name', () => {
    expect(() => new AirlineName('')).toThrow();
    expect(() => new AirlineName('A')).toThrow();
  });

  it('should throw for too long name', () => {
    const longName = 'A'.repeat(101);
    expect(() => new AirlineName(longName)).toThrow();
  });

  it('should compare equality correctly', () => {
    const name = 'LATAM Airlines';
    const n1 = new AirlineName(name);
    const n2 = new AirlineName(name);
    const n3 = new AirlineName('TAM Airlines');
    expect(n1.equals(n2)).toBe(true);
    expect(n1.equals(n3)).toBe(false);
  });
});
