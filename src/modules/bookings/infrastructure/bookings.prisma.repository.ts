import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { IBookingRepository } from '../domain/repositories/booking.repository';
import { Booking } from '../domain/entities/booking.entity';
import { BookingMapper } from './booking.mapper';

@Injectable()
export class BookingsPrismaRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(booking: Booking): Promise<Booking> {
    const persistenceData = BookingMapper.toPersistence(booking);

    const savedBooking = await this.prisma.booking.upsert({
      where: { id: persistenceData.id },
      update: {
        status: persistenceData.status,
        updatedAt: persistenceData.updatedAt,
      },
      create: persistenceData,
      include: {
        itinerary: {
          include: {
            flights: {
              include: {
                flight: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    return BookingMapper.toDomain(savedBooking);
  }

  async findById(id: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
      },
      include: {
        itinerary: {
          include: {
            flights: {
              include: {
                flight: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    return booking ? BookingMapper.toDomain(booking) : null;
  }

  async findByCode(code: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        code,
      },
      include: {
        itinerary: {
          include: {
            flights: {
              include: {
                flight: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    return booking ? BookingMapper.toDomain(booking) : null;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        itinerary: {
          include: {
            flights: {
              include: {
                flight: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return bookings.map((booking) => BookingMapper.toDomain(booking));
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: {
        code,
      },
    });

    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.booking.delete({
      where: { id },
    });
  }
}
