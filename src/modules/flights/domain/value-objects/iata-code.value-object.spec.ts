import { IataCode } from './iata-code.value-object';

describe('IataCode Value Object', () => {
  it('should create valid IATA code', () => {
    const iataCode = new IataCode('IMP');
    expect(iataCode.getValue()).toBe('IMP');
  });

  it('should throw error for invalid format', () => {
    expect(() => new IataCode('imp')).toThrow(
      'IATA code must be exactly 3 uppercase letters',
    );
    expect(() => new IataCode('123')).toThrow(
      'IATA code must be exactly 3 uppercase letters',
    );
    expect(() => new IataCode('IM')).toThrow(
      'IATA code must be exactly 3 uppercase letters',
    );
    expect(() => new IataCode('IMPB')).toThrow(
      'IATA code must be exactly 3 uppercase letters',
    );
  });

  it('should compare equality correctly', () => {
    const code1 = new IataCode('IMP');
    const code2 = new IataCode('IMP');
    const code3 = new IataCode('GIG');

    expect(code1.equals(code2)).toBe(true);
    expect(code1.equals(code3)).toBe(false);
  });

  it('should convert to string', () => {
    const iataCode = new IataCode('IMP');
    expect(iataCode.toString()).toBe('IMP');
  });
});
