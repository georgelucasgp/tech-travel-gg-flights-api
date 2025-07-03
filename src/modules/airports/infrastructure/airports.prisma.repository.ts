import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { IAirportRepository } from '../domain/repositories/airport.repository';
import { Airport } from '../domain/entities/airport.entity';
import { AirportMapper } from './airport.mapper';

@Injectable()
export class AirportsPrismaRepository implements IAirportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(airport: Airport): Promise<Airport> {
    const persistenceData = AirportMapper.toPersistence(airport);

    const savedAirport = await this.prisma.airport.create({
      data: persistenceData,
    });

    return AirportMapper.toDomain(savedAirport);
  }

  async findAll(): Promise<Airport[]> {
    const airports = await this.prisma.airport.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return airports.map((airport) => AirportMapper.toDomain(airport));
  }

  async findById(id: string): Promise<Airport | null> {
    const airport = await this.prisma.airport.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return airport ? AirportMapper.toDomain(airport) : null;
  }

  async findByIataCode(iataCode: string): Promise<Airport | null> {
    const airport = await this.prisma.airport.findFirst({
      where: {
        iataCode,
        deletedAt: null,
      },
    });

    return airport ? AirportMapper.toDomain(airport) : null;
  }

  async update(airport: Airport): Promise<Airport> {
    const persistenceData = AirportMapper.toPersistence(airport);

    const existingAirport = await this.prisma.airport.findFirst({
      where: {
        id: persistenceData.id,
        deletedAt: null,
      },
    });

    if (!existingAirport) {
      throw new NotFoundException('Airport not found');
    }

    const updatedAirport = await this.prisma.airport.update({
      where: { id: persistenceData.id },
      data: {
        ...persistenceData,
        updatedAt: new Date(),
      },
    });

    return AirportMapper.toDomain(updatedAirport);
  }

  async delete(id: string): Promise<void> {
    const existingAirport = await this.prisma.airport.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingAirport) {
      throw new NotFoundException('Airport not found');
    }

    await this.prisma.airport.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
