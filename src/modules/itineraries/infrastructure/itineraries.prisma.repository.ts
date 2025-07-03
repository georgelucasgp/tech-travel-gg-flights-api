import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { IItineraryRepository } from '../domain/repositories/itinerary.repository';
import { Itinerary } from '../domain/entities/itinerary.entity';
import { ItineraryMapper } from './itinerary.mapper';

@Injectable()
export class ItinerariesPrismaRepository implements IItineraryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(itinerary: Itinerary): Promise<Itinerary> {
    const persistenceData = ItineraryMapper.toPersistence(itinerary);

    const savedItinerary = await this.prisma.itinerary.create({
      data: persistenceData,
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
    });

    return ItineraryMapper.toDomain(savedItinerary);
  }

  async findAll(): Promise<Itinerary[]> {
    const itineraries = await this.prisma.itinerary.findMany({
      where: {
        deletedAt: null,
      },
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
    });

    return itineraries.map((itinerary) => ItineraryMapper.toDomain(itinerary));
  }

  async findById(id: string): Promise<Itinerary | null> {
    const itinerary = await this.prisma.itinerary.findFirst({
      where: {
        id,
        deletedAt: null,
      },
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
    });

    return itinerary ? ItineraryMapper.toDomain(itinerary) : null;
  }

  async delete(id: string): Promise<void> {
    const existingItinerary = await this.prisma.itinerary.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingItinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    await this.prisma.itinerary.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
