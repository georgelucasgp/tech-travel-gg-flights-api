import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findAll(showDeleted = false): Promise<Airport[]> {
    const airports = await this.prisma.airport.findMany({
      where: showDeleted ? {} : { deletedAt: null },
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
      },
    });

    return airport ? AirportMapper.toDomain(airport) : null;
  }

  async findByIataCode(iataCode: string): Promise<Airport | null> {
    const airport = await this.prisma.airport.findFirst({
      where: {
        iataCode,
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
    const existingAirport = await this.findById(id);

    if (!existingAirport) {
      throw new NotFoundException('Airport not found');
    }

    if (existingAirport.deletedAt) {
      throw new ConflictException(`Airport with ID ${id} is already deleted`);
    }

    await this.prisma.airport.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async recovery(id: string): Promise<Airport> {
    const recovered = await this.prisma.airport.update({
      where: { id },
      data: { deletedAt: null, updatedAt: new Date() },
    });
    return AirportMapper.toDomain(recovered);
  }
}
