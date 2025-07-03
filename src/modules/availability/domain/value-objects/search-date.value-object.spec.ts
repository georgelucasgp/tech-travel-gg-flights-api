import { SearchDate } from './search-date.value-object';

describe('SearchDate', () => {
  describe('constructor', () => {
    it('should create valid search date from string', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      const searchDate = new SearchDate(dateString);
      expect(searchDate.getDateString()).toBe(dateString);
    });

    it('should create valid search date from Date object', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const searchDate = new SearchDate(tomorrow);
      expect(searchDate.getValue()).toEqual(tomorrow);
    });

    it('should throw error for invalid date format', () => {
      expect(() => new SearchDate('2025-13-01')).toThrow('Invalid search date');
      expect(() => new SearchDate('invalid-date')).toThrow(
        'Search date must be in YYYY-MM-DD format',
      );
      expect(() => new SearchDate('25-12-01')).toThrow(
        'Search date must be in YYYY-MM-DD format',
      );
    });

    it('should throw error for date in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];

      expect(() => new SearchDate(dateString)).toThrow(
        'Search date cannot be in the past',
      );
    });

    it('should accept today as valid date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      expect(() => new SearchDate(dateString)).not.toThrow();
    });

    it('should throw error for non-string and non-Date value', () => {
      expect(() => new SearchDate(123 as any)).toThrow(
        'Search date must be a string or Date',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      const date1 = new SearchDate(dateString);
      const date2 = new SearchDate(dateString);
      expect(date1.equals(date2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const date1 = new SearchDate(tomorrow.toISOString().split('T')[0]);
      const date2 = new SearchDate(
        dayAfterTomorrow.toISOString().split('T')[0],
      );
      expect(date1.equals(date2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return date string in YYYY-MM-DD format', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      const searchDate = new SearchDate(dateString);
      expect(searchDate.toString()).toBe(dateString);
    });
  });
});
