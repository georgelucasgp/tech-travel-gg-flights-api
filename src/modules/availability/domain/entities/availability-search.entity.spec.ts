import {
  AvailabilitySearch,
  AvailabilitySearchProps,
} from './availability-search.entity';

describe('AvailabilitySearch', () => {
  const createAvailabilitySearch = (
    params: Partial<AvailabilitySearchProps> = {},
  ): AvailabilitySearch => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    return AvailabilitySearch.create({
      origin: params.origin || 'BSB',
      destination: params.destination || 'GIG',
      departureDate: params.departureDate
        ? params.departureDate
        : tomorrow.toISOString().split('T')[0],
      returnDate: params.returnDate
        ? params.returnDate
        : dayAfterTomorrow.toISOString().split('T')[0],
      airlines: params.airlines || ['LA', 'AZ'],
      maxStops: params.maxStops || 1,
    });
  };

  describe('create', () => {
    it('should create valid availability search', () => {
      const search = createAvailabilitySearch();

      expect(search.origin.getValue()).toBe('BSB');
      expect(search.destination.getValue()).toBe('GIG');
      expect(search.departureDate.getDateString()).toBe(
        search.departureDate.getDateString(),
      );
      expect(search.returnDate?.getDateString()).toBe(
        search.returnDate?.getDateString(),
      );
      expect(search.preferredAirlines.getValue()).toEqual(['LA', 'AZ']);
      expect(search.maxStops.getValue()).toBe(1);
    });

    it('should throw error for same origin and destination', () => {
      expect(() => createAvailabilitySearch({ destination: 'BSB' })).toThrow(
        'Origin and destination cannot be the same',
      );
    });

    it('should throw error for return date before departure date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      expect(() =>
        createAvailabilitySearch({
          departureDate: dayAfterTomorrow.toISOString().split('T')[0],
          returnDate: tomorrow.toISOString().split('T')[0],
        }),
      ).toThrow('Return date must be after departure date');
    });
  });

  describe('isRoundTrip', () => {
    it('should return true when return date is provided', () => {
      const search = createAvailabilitySearch();

      expect(search.isRoundTrip()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for identical searches', () => {
      const search1 = createAvailabilitySearch();
      const search2 = createAvailabilitySearch();

      expect(search1.equals(search2)).toBe(true);
    });

    it('should return false for different origins', () => {
      const search1 = createAvailabilitySearch();
      const search2 = createAvailabilitySearch({
        origin: 'GRU',
      });

      expect(search1.equals(search2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation for round trip', () => {
      const search = createAvailabilitySearch();

      const result = search.toString();
      expect(result).toContain('BSB → GIG');
      expect(result).toContain(
        `Departure: ${search.departureDate.getDateString()}`,
      );
      expect(result).toContain(`Return: ${search.returnDate?.getDateString()}`);
    });
  });
});
