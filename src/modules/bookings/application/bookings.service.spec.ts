import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { IBookingRepository } from '../domain/repositories/booking.repository';
import { IItineraryRepository } from '../../itineraries/domain/repositories/itinerary.repository';
import { BookingStatus } from '../domain/value-objects/booking-status.value-object';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingFactory } from './booking.factory';
import { ItineraryFactory } from 'src/modules/itineraries/application/itinerary.factory';
import { FlightFactory } from 'src/modules/flights/application/flight.factory';
import { Booking } from '../domain/entities/booking.entity';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepo: jest.Mocked<IBookingRepository>;
  let itineraryRepo: jest.Mocked<IItineraryRepository>;

  const mockFlight = FlightFactory.create({
    id: '869a1938-d193-4a00-8a62-94b06fda6046',
    flight_number: 'LA3456',
    airline_id: '869a1938-d193-4a00-8a62-94b06fda6046',
    origin_iata: 'BSB',
    destination_iata: 'CGH',
    departure_datetime: new Date('2025-07-03T10:00:00Z'),
    arrival_datetime: new Date('2025-07-03T12:00:00Z'),
    frequency: [1, 2, 3, 4, 5],
  });

  const mockItinerary = ItineraryFactory.create({
    id: '869a1938-d193-4a00-8a62-94b06fda6046',
    flights: [mockFlight],
  });

  const mockBooking = BookingFactory.create({
    id: '869a1938-d193-4a00-8a62-94b06fda6046',
    user_id: 'b36297ad-1d6a-43c1-a2d3-59a488775437',
    itinerary: mockItinerary,
    code: 'ABC123',
    status: BookingStatus.pending().getValue(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(async () => {
    const bookingRepoFactory = (): jest.Mocked<IBookingRepository> => ({
      create: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByUserId: jest.fn(),
      existsByCode: jest.fn(),
      delete: jest.fn(),
    });

    const itineraryRepoFactory = (): jest.Mocked<IItineraryRepository> => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: 'IBookingRepository', useFactory: bookingRepoFactory },
        { provide: 'IItineraryRepository', useFactory: itineraryRepoFactory },
      ],
    }).compile();
    service = module.get(BookingsService);
    bookingRepo = module.get('IBookingRepository');
    itineraryRepo = module.get('IItineraryRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create booking successfully', async () => {
      jest.spyOn(itineraryRepo, 'findById').mockResolvedValue(mockItinerary);
      jest.spyOn(bookingRepo, 'existsByCode').mockResolvedValue(false);
      const createSpy = jest
        .spyOn(bookingRepo, 'create')
        .mockResolvedValue(mockBooking);

      const result = await service.create({
        user_id: 'b36297ad-1d6a-43c1-a2d3-59a488775437',
        itinerary_id: '869a1938-d193-4a00-8a62-94b06fda6046',
      });

      expect(createSpy).toHaveBeenCalledWith(expect.any(Booking));
      expect(result).toBe(mockBooking);
    });

    it('should throw if itinerary not found', async () => {
      jest.spyOn(itineraryRepo, 'findById').mockResolvedValue(null);
      await expect(
        service.create({
          user_id: 'b36297ad-1d6a-43c1-a2d3-59a488775437',
          itinerary_id: '869a1938-d193-4a00-8a62-94b06fda6046',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if cannot generate unique code', async () => {
      jest.spyOn(itineraryRepo, 'findById').mockResolvedValue(mockItinerary);
      jest.spyOn(bookingRepo, 'existsByCode').mockResolvedValue(true);

      await expect(
        service.create({
          user_id: 'b36297ad-1d6a-43c1-a2d3-59a488775437',
          itinerary_id: '869a1938-d193-4a00-8a62-94b06fda6046',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return booking when found', async () => {
      jest.spyOn(bookingRepo, 'findById').mockResolvedValue(mockBooking);
      const result = await service.findById(
        '869a1938-d193-4a00-8a62-94b06fda6046',
      );
      expect(result).toBe(mockBooking);
    });

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(bookingRepo, 'findById').mockResolvedValue(null);
      await expect(
        service.findById('869a1938-d193-4a00-8a62-94b06fda6046'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel booking successfully', async () => {
      jest.spyOn(bookingRepo, 'findById').mockResolvedValue(mockBooking);
      const createSpy = jest
        .spyOn(bookingRepo, 'create')
        .mockResolvedValue(mockBooking);

      const cancelSpy = jest
        .spyOn(mockBooking, 'cancel')
        .mockImplementation(() => {});

      await service.cancel('869a1938-d193-4a00-8a62-94b06fda6046');
      expect(cancelSpy).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledWith(expect.any(Booking));
    });

    it('should throw NotFoundException if booking not found', async () => {
      jest.spyOn(bookingRepo, 'findById').mockResolvedValue(null);
      await expect(
        service.cancel('869a1938-d193-4a00-8a62-94b06fda6046'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if cancel throws', async () => {
      jest.spyOn(bookingRepo, 'findById').mockResolvedValue(mockBooking);
      const cancelSpy = jest
        .spyOn(mockBooking, 'cancel')
        .mockImplementation(() => {
          throw new Error('Cannot cancel');
        });
      await expect(
        service.cancel('869a1938-d193-4a00-8a62-94b06fda6046'),
      ).rejects.toThrow(BadRequestException);
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete booking successfully', async () => {
      jest.spyOn(bookingRepo, 'findById').mockResolvedValue(mockBooking);
      const deleteSpy = jest.spyOn(bookingRepo, 'delete').mockResolvedValue();
      await service.delete('869a1938-d193-4a00-8a62-94b06fda6046');
      expect(deleteSpy).toHaveBeenCalledWith(
        '869a1938-d193-4a00-8a62-94b06fda6046',
      );
    });
    it('should throw NotFoundException if booking not found', async () => {
      jest.spyOn(bookingRepo, 'findById').mockResolvedValue(null);
      await expect(
        service.delete('869a1938-d193-4a00-8a62-94b06fda6046'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
