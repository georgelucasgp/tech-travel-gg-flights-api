import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { IAirlineRepository } from '../domain/repositories/airline.repository';
import { Airline } from '../domain/entities/airline.entity';
import { AirlineMapper } from './airline.mapper';

@Injectable()
export class AirlinesPrismaRepository implements IAirlineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(airline: Airline): Promise<Airline> {
    const persistenceData = AirlineMapper.toPersistence(airline);

    const savedAirline = await this.prisma.airline.create({
      data: persistenceData,
    });

    return AirlineMapper.toDomain(savedAirline);
  }

  async findAll(showDeleted = false): Promise<Airline[]> {
    const airlines = await this.prisma.airline.findMany({
      where: showDeleted ? {} : { deletedAt: null },
      orderBy: {
        name: 'asc',
      },
    });

    return airlines.map((airline) => AirlineMapper.toDomain(airline));
  }

  async findById(id: string): Promise<Airline | null> {
    const airline = await this.prisma.airline.findFirst({
      where: {
        id,
      },
    });

    return airline ? AirlineMapper.toDomain(airline) : null;
  }

  async findByIataCode(iataCode: string): Promise<Airline | null> {
    const airline = await this.prisma.airline.findFirst({
      where: {
        iataCode,
      },
    });

    return airline ? AirlineMapper.toDomain(airline) : null;
  }

  async update(airline: Airline): Promise<Airline> {
    const persistenceData = AirlineMapper.toPersistence(airline);

    const existingAirline = await this.prisma.airline.findFirst({
      where: {
        id: persistenceData.id,
        deletedAt: null,
      },
    });

    if (!existingAirline) {
      throw new NotFoundException('Airline not found');
    }

    const updatedAirline = await this.prisma.airline.update({
      where: { id: persistenceData.id },
      data: {
        ...persistenceData,
        updatedAt: new Date(),
      },
    });

    return AirlineMapper.toDomain(updatedAirline);
  }

  async delete(id: string): Promise<void> {
    const existingAirline = await this.prisma.airline.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingAirline) {
      throw new NotFoundException('Airline not found');
    }

    await this.prisma.airline.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async recovery(id: string): Promise<Airline> {
    const recovered = await this.prisma.airline.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return AirlineMapper.toDomain(recovered);
  }
}
