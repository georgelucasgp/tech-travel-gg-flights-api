import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { BookingsPrismaRepository } from './bookings.prisma.repository';
import { IntegrationTestHelper } from '../../../../test/helpers/integration-test.helper';
import { BookingFactory } from '../application/booking.factory';
import { ItineraryFactory } from '../../itineraries/application/itinerary.factory';
import { FlightFactory } from '../../flights/application/flight.factory';
import { BookingStatus } from '../domain/value-objects/booking-status.value-object';
import { Booking } from '../domain/entities/booking.entity';

describe('BookingsPrismaRepository (Integration)', () => {
  let repository: BookingsPrismaRepository;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsPrismaRepository, PrismaService],
    }).compile();

    repository = module.get<BookingsPrismaRepository>(BookingsPrismaRepository);
    prisma = module.get<PrismaService>(PrismaService);
    helper = IntegrationTestHelper.getInstance(prisma);
    await helper.setup();
  });

  beforeEach(async () => {
    await helper.cleanup();
    await setupTestData();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  const setupTestData = async () => {
    await prisma.flight.create({
      data: {
        id: 'bd04322f-ae22-459e-a2e3-4e7fc4992276',
        flightNumber: 'LA3856',
        airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
        originIata: 'BSB',
        destinationIata: 'CGH',
        departureDatetime: new Date('2025-07-03T10:00:00Z'),
        arrivalDatetime: new Date('2025-07-03T12:00:00Z'),
        frequency: [1, 2, 3],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.itinerary.create({
      data: {
        id: 'b66cfa8b-3f09-4644-8052-cf82511a463b',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.itineraryFlight.create({
      data: {
        itineraryId: 'b66cfa8b-3f09-4644-8052-cf82511a463b',
        flightId: 'bd04322f-ae22-459e-a2e3-4e7fc4992276',
        order: 0,
      },
    });

    await prisma.user.create({
      data: {
        id: 'ea2a9bf1-00c6-4fa9-a644-567e08cbf66c',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  };

  const getValidBookingProps = (code = 'ABC123') => {
    const mockFlight = FlightFactory.create({
      id: 'bd04322f-ae22-459e-a2e3-4e7fc4992276',
      flight_number: 'LA3856',
      airline_id: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
      origin_iata: 'BSB',
      destination_iata: 'CGH',
      departure_datetime: new Date('2025-07-03T10:00:00Z'),
      arrival_datetime: new Date('2025-07-03T12:00:00Z'),
      frequency: [1, 2, 3],
    });

    const mockItinerary = ItineraryFactory.create({
      id: 'b66cfa8b-3f09-4644-8052-cf82511a463b',
      flights: [mockFlight],
    });

    return {
      user_id: 'ea2a9bf1-00c6-4fa9-a644-567e08cbf66c',
      itinerary: mockItinerary,
      code,
      status: BookingStatus.pending().getValue(),
    };
  };

  describe('create()', () => {
    it('should create a booking successfully', async () => {
      const bookingProps = getValidBookingProps('DEF456');
      const bookingEntity = BookingFactory.create(bookingProps);

      const createdBooking = await repository.create(bookingEntity);

      expect(createdBooking).toBeInstanceOf(Booking);
      expect(createdBooking.code.getValue()).toBe('DEF456');
      expect(createdBooking.userId).toBe(
        'ea2a9bf1-00c6-4fa9-a644-567e08cbf66c',
      );
      expect(createdBooking.status.isPending()).toBe(true);

      const savedBooking = await prisma.booking.findUnique({
        where: { id: bookingEntity.id.getValue() },
      });

      expect(savedBooking).not.toBeNull();
      expect(savedBooking?.code).toBe('DEF456');
      expect(savedBooking?.status).toBe('PENDING');
    });
  });

  describe('findById()', () => {
    it('should find booking by id', async () => {
      const bookingProps = getValidBookingProps('GHI789');
      const bookingEntity = BookingFactory.create(bookingProps);
      await repository.create(bookingEntity);

      const foundBooking = await repository.findById(
        bookingEntity.id.getValue(),
      );

      expect(foundBooking).toBeInstanceOf(Booking);
      expect(foundBooking?.code.getValue()).toBe('GHI789');
      expect(foundBooking?.userId).toBe('ea2a9bf1-00c6-4fa9-a644-567e08cbf66c');
    });
  });

  describe('update()', () => {
    it('should update booking status via create method', async () => {
      const bookingProps = getValidBookingProps('JKL012');
      const bookingEntity = BookingFactory.create(bookingProps);
      await repository.create(bookingEntity);

      bookingEntity.confirm();
      const updatedBooking = await repository.create(bookingEntity);

      expect(updatedBooking.status.isConfirmed()).toBe(true);

      const savedBooking = await prisma.booking.findUnique({
        where: { id: bookingEntity.id.getValue() },
      });

      expect(savedBooking?.status).toBe('CONFIRMED');
    });
  });

  describe('delete()', () => {
    it('should soft delete booking', async () => {
      const bookingProps = getValidBookingProps('MNO345');
      const bookingEntity = BookingFactory.create(bookingProps);
      await repository.create(bookingEntity);

      await repository.delete(bookingEntity.id.getValue());

      const deletedBooking = await prisma.booking.findUnique({
        where: { id: bookingEntity.id.getValue() },
      });

      expect(deletedBooking).toBeNull();
    });
  });
});
