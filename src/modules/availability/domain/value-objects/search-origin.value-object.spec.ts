import { SearchOrigin } from './search-origin.value-object';

describe('SearchOrigin', () => {
  describe('constructor', () => {
    it('should create valid search origin', () => {
      const searchOrigin = new SearchOrigin('BSB');
      expect(searchOrigin.getValue()).toBe('BSB');
    });

    it('should convert to uppercase', () => {
      const searchOrigin = new SearchOrigin('bsb');
      expect(searchOrigin.getValue()).toBe('BSB');
    });

    it('should throw error for null/undefined value', () => {
      expect(() => new SearchOrigin(null as any)).toThrow(
        'Search origin is required and must be a string',
      );
      expect(() => new SearchOrigin(undefined as any)).toThrow(
        'Search origin is required and must be a string',
      );
    });

    it('should throw error for non-string value', () => {
      expect(() => new SearchOrigin(123 as any)).toThrow(
        'Search origin is required and must be a string',
      );
    });

    it('should throw error for invalid length', () => {
      expect(() => new SearchOrigin('AB')).toThrow(
        'Search origin must be a 3-character IATA code',
      );
      expect(() => new SearchOrigin('ABCD')).toThrow(
        'Search origin must be a 3-character IATA code',
      );
    });

    it('should throw error for non-alphabetic characters', () => {
      expect(() => new SearchOrigin('AB1')).toThrow(
        'Search origin must contain only letters',
      );
      expect(() => new SearchOrigin('A-B')).toThrow(
        'Search origin must contain only letters',
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal values', () => {
      const origin1 = new SearchOrigin('BSB');
      const origin2 = new SearchOrigin('BSB');
      expect(origin1.equals(origin2)).toBe(true);
    });

    it('should return false for different values', () => {
      const origin1 = new SearchOrigin('BSB');
      const origin2 = new SearchOrigin('GIG');
      expect(origin1.equals(origin2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const searchOrigin = new SearchOrigin('BSB');
      expect(searchOrigin.toString()).toBe('BSB');
    });
  });
});
