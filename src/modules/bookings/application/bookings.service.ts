import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IBookingRepository } from '../domain/repositories/booking.repository';
import { IItineraryRepository } from '../../itineraries/domain/repositories/itinerary.repository';
import { Booking } from '../domain/entities/booking.entity';
import { BookingFactory } from './booking.factory';
import { BookingCode } from '../domain/value-objects/booking-code.value-object';
import { BookingStatus } from '../domain/value-objects/booking-status.value-object';
import { Itinerary } from '../../itineraries/domain/entities/itinerary.entity';
import { CreateBookingDto } from '../presentation/dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepository: IBookingRepository,
    @Inject('IItineraryRepository')
    private readonly itineraryRepository: IItineraryRepository,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const itinerary = await this.itineraryRepository.findById(
      createBookingDto.itinerary_id,
    );
    if (!itinerary) {
      throw new NotFoundException(
        `Itinerary with ID ${createBookingDto.itinerary_id} not found`,
      );
    }

    const booking = await this.generateUniqueBooking(
      createBookingDto.user_id,
      itinerary,
    );

    return await this.bookingRepository.create(booking);
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async findByCode(code: string): Promise<Booking> {
    const booking = await this.bookingRepository.findByCode(code);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.findByUserId(userId);
  }

  async delete(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.bookingRepository.delete(id);
  }

  private async generateUniqueBooking(
    user_id: string,
    itinerary: Itinerary,
  ): Promise<Booking> {
    const maxAttempts = 10;
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const booking = BookingFactory.create({
        user_id,
        itinerary,
        code: BookingCode.create().getValue(),
        status: BookingStatus.pending().getValue(),
        createdAt: new Date(),
        updatedAt: new Date(),
        id: undefined,
      });

      const exists = await this.bookingRepository.existsByCode(
        booking.code.getValue(),
      );
      if (!exists) {
        return booking;
      }
    }
    throw new BadRequestException(
      'Failed to generate unique booking code after 10 attempts',
    );
  }
}
