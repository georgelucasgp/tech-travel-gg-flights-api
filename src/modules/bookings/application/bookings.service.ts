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

export interface CreateBookingDto {
  userId: string;
  itineraryId: string;
}

@Injectable()
export class BookingsService {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepository: IBookingRepository,
    @Inject('IItineraryRepository')
    private readonly itineraryRepository: IItineraryRepository,
  ) {}

  async create(createDto: CreateBookingDto): Promise<Booking> {
    const itinerary = await this.itineraryRepository.findById(
      createDto.itineraryId,
    );
    if (!itinerary) {
      throw new BadRequestException(
        `Itinerary with ID ${createDto.itineraryId} not found`,
      );
    }

    const booking = await this.generateUniqueBooking(
      createDto.userId,
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

  async cancel(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    try {
      booking.cancel();
      await this.bookingRepository.create(booking);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    await this.bookingRepository.delete(id);
  }

  private async generateUniqueBooking(
    userId: string,
    itinerary: Itinerary,
  ): Promise<Booking> {
    const maxAttempts = 10;
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const booking = BookingFactory.create({
        userId,
        itinerary,
        code: BookingCode.create().getValue(),
        status: BookingStatus.pending().getValue(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
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
