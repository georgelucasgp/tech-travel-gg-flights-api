import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import {
  IItineraryRepository,
  ItinerarySearchCriteria,
} from '../domain/repositories/itinerary.repository';
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
            flight: {
              include: {
                airline: true,
              },
            },
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
      include: {
        flights: {
          include: {
            flight: {
              include: {
                airline: true,
              },
            },
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
      },
      include: {
        flights: {
          include: {
            flight: {
              include: {
                airline: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return itinerary ? ItineraryMapper.toDomain(itinerary) : null;
  }

  async findByCriteria(
    criteria: ItinerarySearchCriteria,
  ): Promise<Itinerary[]> {
    const startOfDay = new Date(criteria.date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(criteria.date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const itineraries = await this.prisma.itinerary.findMany({
      where: {
        AND: [
          {
            flights: {
              some: {
                order: 1,
                flight: {
                  originIata: criteria.origin,
                  departureDatetime: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                  frequency: {
                    has: criteria.date.getUTCDay(),
                  },
                  ...(criteria.airline_codes &&
                    criteria.airline_codes.length > 0 && {
                      airline: {
                        iataCode: {
                          in: criteria.airline_codes,
                        },
                      },
                    }),
                },
              },
            },
          },
          {
            flights: {
              some: {
                flight: {
                  destinationIata: criteria.destination,
                },
              },
            },
          },
        ],
      },
      include: {
        flights: {
          include: {
            flight: {
              include: {
                airline: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    let filteredItineraries = itineraries.map((itinerary) =>
      ItineraryMapper.toDomain(itinerary),
    );

    if (criteria.max_stops !== undefined) {
      filteredItineraries = filteredItineraries.filter(
        (itinerary) => itinerary.stops <= criteria.max_stops!,
      );
    }

    filteredItineraries = filteredItineraries.filter((itinerary) => {
      const firstFlight = itinerary.flights[0];
      return firstFlight?.frequency.includesDay(criteria.date.getUTCDay());
    });

    return filteredItineraries;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.itinerary.delete({
      where: { id },
    });
  }
}
