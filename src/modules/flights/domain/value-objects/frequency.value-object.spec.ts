import { Frequency } from './frequency.value-object';

describe('Frequency Value Object', () => {
  it('should create valid frequency', () => {
    const frequency = new Frequency([1, 3, 5]);
    expect(frequency.getValue()).toEqual([1, 3, 5]);
  });

  it('should throw error for invalid days', () => {
    expect(() => new Frequency([])).toThrow(
      'Frequency must contain at least one day',
    );
    expect(() => new Frequency([7])).toThrow(
      'Invalid days: 7. Days must be 0-6 (Sunday=0, Saturday=6)',
    );
    expect(() => new Frequency([-1])).toThrow(
      'Invalid days: -1. Days must be 0-6 (Sunday=0, Saturday=6)',
    );
    expect(() => new Frequency([1, 1])).toThrow(
      'Frequency cannot contain duplicate days',
    );
  });

  it('should sort and compare correctly', () => {
    const freq1 = new Frequency([5, 1, 3]);
    const freq2 = new Frequency([1, 3, 5]);
    const freq3 = new Frequency([0, 6]);

    expect(freq1.getValue()).toEqual([1, 3, 5]);
    expect(freq1.equals(freq2)).toBe(true);
    expect(freq1.equals(freq3)).toBe(false);
  });
});
