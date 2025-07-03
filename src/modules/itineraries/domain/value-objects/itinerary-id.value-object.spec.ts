import { ItineraryId } from './itinerary-id.value-object';

describe('ItineraryId', () => {
  describe('create', () => {
    it('should create an ItineraryId with a generated UUID when no value is provided', () => {
      const itineraryId = ItineraryId.create();

      expect(itineraryId).toBeInstanceOf(ItineraryId);
      expect(itineraryId.getValue()).toBeDefined();
    });

    it('should create an ItineraryId with the provided valid UUID', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const itineraryId = ItineraryId.create(validUuid);

      expect(itineraryId.getValue()).toBe(validUuid);
    });

    it('should throw an error for empty value', () => {
      expect(() => ItineraryId.create('')).toThrow(
        'ItineraryId cannot be empty',
      );
    });

    it('should throw an error for non-string value', () => {
      expect(() => ItineraryId.create(null as any)).toThrow(
        'ItineraryId must be a string',
      );
      expect(() => ItineraryId.create(undefined as any)).toThrow(
        'ItineraryId must be a string',
      );
      expect(() => ItineraryId.create(123 as any)).toThrow(
        'ItineraryId must be a string',
      );
    });

    it('should throw an error for invalid UUID format', () => {
      expect(() => ItineraryId.create('invalid-uuid')).toThrow(
        'ItineraryId must be a valid UUID',
      );
      expect(() => ItineraryId.create('123456789')).toThrow(
        'ItineraryId must be a valid UUID',
      );
      expect(() =>
        ItineraryId.create('550e8400-e29b-41d4-a716-44665544000'),
      ).toThrow('ItineraryId must be a valid UUID');
    });
  });

  describe('equals', () => {
    it('should return true for ItineraryIds with the same value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const itineraryId1 = ItineraryId.create(uuid);
      const itineraryId2 = ItineraryId.create(uuid);

      expect(itineraryId1.equals(itineraryId2)).toBe(true);
    });

    it('should return false for ItineraryIds with different values', () => {
      const itineraryId1 = ItineraryId.create(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      const itineraryId2 = ItineraryId.create(
        '550e8400-e29b-41d4-a716-446655440001',
      );

      expect(itineraryId1.equals(itineraryId2)).toBe(false);
    });
  });
});
