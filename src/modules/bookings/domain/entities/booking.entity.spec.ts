import { Booking } from './booking.entity';
import { BookingCode, BookingStatus } from '../value-objects';
import { BadRequestException } from '@nestjs/common';
import { ItineraryFactory } from '../../../itineraries/application/itinerary.factory';
import { randomUUID } from 'crypto';
import { FlightFactory } from 'src/modules/flights/application/flight.factory';
import {
  BookingFactory,
  BookingFactoryProps,
} from 'src/modules/bookings/application/booking.factory';

describe('Booking Entity', () => {
  const mockItinerary = ItineraryFactory.create({
    id: randomUUID(),
    flights: [
      FlightFactory.create({
        id: randomUUID(),
        flightNumber: 'LA3000',
        airlineId: '301cc2b2-f6d2-461f-a284-bf58f00286d3',
        originIata: 'BSB',
        destinationIata: 'CGH',
        departureDatetime: new Date('2025-07-01T09:30:00Z'),
        arrivalDatetime: new Date('2025-07-01T10:30:00Z'),
        frequency: [1, 2, 3, 4, 5],
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const createBooking = (
    params: Partial<BookingFactoryProps> = {},
  ): Booking => {
    return BookingFactory.create({
      id: params.id ?? randomUUID(),
      userId: params.userId ?? '6c12a14f-4675-41cf-908f-e42fe0ed2906',
      itinerary: params.itinerary ?? mockItinerary,
      code: params.code ?? BookingCode.create().toString(),
      status: params.status ?? BookingStatus.pending().toString(),
      createdAt: params.createdAt ?? new Date(),
      updatedAt: params.updatedAt ?? new Date(),
      deletedAt: params.deletedAt ?? null,
    });
  };

  it('should create a booking with default values', () => {
    const booking = createBooking();
    expect(booking).toBeInstanceOf(Booking);
    expect(booking.userId).toBe('6c12a14f-4675-41cf-908f-e42fe0ed2906');
    expect(booking.itinerary.id.getValue()).toBe(mockItinerary.id.getValue());
    expect(booking.status.isPending()).toBe(true);
    expect(booking.code.getValue()).toHaveLength(6);
    expect(booking.id).toBeDefined();
    expect(booking.createdAt).toBeInstanceOf(Date);
    expect(booking.updatedAt).toBeInstanceOf(Date);
  });

  it('should use provided id, code and status', () => {
    const id = '915a44ca-77c1-4f85-9a96-987967ccb141';
    const code = BookingCode.create('ABC123');
    const status = BookingStatus.confirmed();
    const booking = createBooking({
      id,
      code: code.toString(),
      status: status.toString(),
    });
    expect(booking.id.getValue()).toBe(id);
    expect(booking.code.getValue()).toBe(code.getValue());
    expect(booking.status.getValue()).toBe(status.getValue());
  });

  it('should confirm a pending booking', () => {
    const booking = createBooking();
    booking.confirm();
    expect(booking.status.isConfirmed()).toBe(true);
  });

  it('should not confirm a non-pending booking', () => {
    const booking = createBooking({
      status: BookingStatus.confirmed().toString(),
    });
    expect(() => booking.confirm()).toThrow(BadRequestException);
  });

  it('should cancel a booking if allowed', () => {
    const booking = createBooking();
    booking.cancel();
    expect(booking.status.isCancelled()).toBe(true);
  });

  it('should not cancel a booking if not allowed', () => {
    const booking = createBooking({
      status: BookingStatus.cancelled().toString(),
    });
    expect(() => booking.cancel()).toThrow(BadRequestException);
  });

  it('should throw if userId is empty', () => {
    expect(() => createBooking({ userId: '' })).toThrow(BadRequestException);
  });

  it('should compare equality by id', () => {
    const id = randomUUID();
    const booking1 = createBooking({ id });
    const booking2 = createBooking({ id });
    expect(booking1.id.equals(booking2.id)).toBe(true);
  });
});
